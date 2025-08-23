/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
// removed unused imports: onRequest, logger

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

admin.initializeApp();

// Use the CORS middleware to reliably handle preflight requests and set
// Access-Control-Allow-* headers.
const corsMiddleware = cors({ origin: true, methods: ['POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] });

// Small type guards were removed because they were not used in this file.

type OrderItem = { productId: string; nombre: string; precio: number; cantidad: number };

type CreateOrderRequest = {
  items: OrderItem[];
  envio?: { tipo?: 'express' | string };
  direccionEnvio?: unknown;
  metodoPagoSimulado?: unknown;
};

// Helper which performs the transactional order creation for a given userId and payload.
async function performCreateOrder(userId: string, data: CreateOrderRequest) {
  const { items, envio, direccionEnvio, metodoPagoSimulado } = data || {} as CreateOrderRequest;

  if (!items || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Carrito vacío');
  }

  const db = admin.firestore();
  let subtotal = 0;
  const productsToUpdate: { ref: admin.firestore.DocumentReference; newStock: number }[] = [];

  await db.runTransaction(async (transaction) => {
    for (const item of items) {
      const productRef = db.doc(`products/${item.productId}`);
      const product = await transaction.get(productRef);
      if (!product.exists) {
        throw new functions.https.HttpsError('not-found', `Producto ${item.productId} no existe`);
      }
      const productData = product.data();
      if (!productData) {
        throw new functions.https.HttpsError('not-found', `Producto ${item.productId} sin datos`);
      }
      const stock = Number(productData.stock ?? 0);
      const precio = Number(productData.precio ?? 0);
      if (stock < item.cantidad) {
        const pd = productData as Record<string, unknown>;
        const nombre = typeof pd.nombre === 'string' ? pd.nombre : item.productId;
        throw new functions.https.HttpsError('failed-precondition', `Stock insuficiente para ${nombre}`);
      }
      subtotal += precio * item.cantidad;
      productsToUpdate.push({ ref: productRef, newStock: stock - item.cantidad });
    }

    for (const { ref, newStock } of productsToUpdate) {
      transaction.update(ref, { stock: newStock });
    }

    const envioCosto = envio?.tipo === 'express' ? 10 : 5;
    const total = subtotal + envioCosto;

    const orderRef = db.collection('orders').doc();
    const creadoEnISO = admin.firestore.Timestamp.now().toDate().toISOString();
    transaction.set(orderRef, {
      userId,
      items: items.map((item: OrderItem) => ({
        productId: item.productId,
        nombre: item.nombre,
        precioUnit: item.precio,
        cantidad: item.cantidad,
      })),
      subtotal,
      envio: { tipo: envio?.tipo || 'standard', costo: envioCosto },
      total,
      direccionEnvio,
      metodoPagoSimulado,
      estado: 'pendiente',
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
      creadoEnISO,
    });
  });

  return { success: true };
}

// Callable version (keeps existing behavior for SDK httpsCallable)
function isCallableContext(obj: unknown): obj is { auth: { uid: string } } {
  if (typeof obj !== 'object' || obj === null) return false;
  const auth = (obj as Record<string, unknown>)['auth'];
  if (typeof auth !== 'object' || auth === null) return false;
  const uid = (auth as Record<string, unknown>)['uid'];
  return typeof uid === 'string';
}

export const createOrder = functions.https.onCall(async (data: unknown, context: unknown) => {
  if (!isCallableContext(context)) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
  }
  const userId = context.auth.uid;
  return performCreateOrder(userId, data as CreateOrderRequest);
});

// HTTP wrapper that supports CORS preflight and accepts a Bearer ID token in Authorization header.
export const createOrderHttp = functions.https.onRequest(async (req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const origin = req.headers.origin || '*';
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      if (req.method === 'OPTIONS') { res.status(204).end(); return; }
      const auth = req.get('Authorization') || '';
      if (!auth.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthenticated' });
        return;
      }
      const idToken = auth.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      const userId = decoded.uid;
      const data = req.body as CreateOrderRequest;

      // performCreateOrder already uses serverTimestamp(); we'll also add a
      // readable ISO timestamp on the order for immediate client consumption.
      // To do that we slightly wrap the transactional call to set the extra field.
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();

      // We'll reuse performCreateOrder's logic but create the order document
      // inside a transaction here so we can set the ISO string as well.
      // For simplicity and to keep behavior identical, call performCreateOrder
      // which will create the order and decrement stock; then update the
      // created order document with the ISO timestamp if necessary.
      const result = await performCreateOrder(userId, data);

      // Try to find the most-recent order by this user with same subtotal/total
      // and set creadoEnISO. This is a best-effort step and will not fail the
      // whole request if it cannot update.
      try {
        const itemsArr = Array.isArray(data?.items) ? (data!.items as OrderItem[]) : [];
        const subtotal = itemsArr.reduce((s: number, it: OrderItem) => s + (Number(it.precio || 0) * Number(it.cantidad || 0)), 0);
        const envioCosto = data?.envio?.tipo === 'express' ? 10 : 5;
        const total = subtotal + envioCosto;
        const ordersRef = db.collection('orders');
        const snap = await ordersRef.where('userId', '==', userId).where('total', '==', total).orderBy('creadoEn', 'desc').limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          await doc.ref.update({ creadoEnISO: now.toDate().toISOString() });
        }
      } catch (e) {
        // best-effort only
        console.warn('Could not update creadoEnISO', e);
      }

      res.json(result);
    } catch (err: unknown) {
      // Mirror HttpsError codes where possible
      if (err instanceof functions.https.HttpsError) {
        const he = err as functions.https.HttpsError;
        const code = he.code === 'unauthenticated' ? 401 : (he.code === 'invalid-argument' ? 400 : 500);
        res.status(code).set('Access-Control-Allow-Origin', req.headers.origin || '*').json({ error: he.message });
      } else {
        console.error('createOrderHttp error', err);
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).set('Access-Control-Allow-Origin', req.headers.origin || '*').json({ error: msg });
      }
    }
  });
});

// Opcional: setUserRole
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setUserRole = functions.https.onCall(async (data: any, context: any) => {
  if (!context || !context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
  }
  const callerDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  if (callerDoc.data()?.rol !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Solo admin');
  }
  const { userId, rol } = data || {};
  if (!userId || !rol) throw new functions.https.HttpsError('invalid-argument', 'Parámetros faltantes');
  await admin.firestore().doc(`users/${userId}`).update({ rol });
  return { success: true };
});

// Cancel an order: increment stock atomically and mark order as canceled
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cancelOrder = functions.https.onCall(async (data: any, context: any) => {
  if (!context || !context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
  }
  const userId = context.auth.uid;
  const { orderId } = data || {};
  if (!orderId) throw new functions.https.HttpsError('invalid-argument', 'orderId requerido');

  const db = admin.firestore();

  await db.runTransaction(async (tx) => {
    const orderRef = db.doc(`orders/${orderId}`);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new functions.https.HttpsError('not-found', 'Order not found');
    const orderData = orderSnap.data() as Record<string, unknown> | undefined;
    if (!orderData) throw new functions.https.HttpsError('not-found', 'Order data missing');
    // ensure the requester is the owner of the order (or admin)
    const ownerId = orderData.userId as string | undefined;
    if (ownerId !== userId) {
      // allow admin to cancel via role check
      const callerDoc = await admin.firestore().doc(`users/${userId}`).get();
      if (callerDoc.data()?.rol !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'No autorizado');
      }
    }

  const items = (orderData.items as Array<Record<string, unknown>>) || [];
    // increment stock for each item
    for (const it of items) {
      const pid = it.productId as string;
      const qty = Number(it.cantidad ?? 0);
      const prodRef = db.doc(`products/${pid}`);
      const prodSnap = await tx.get(prodRef);
      if (!prodSnap.exists) continue; // skip if product missing
      const prodData = prodSnap.data();
      const stock = Number(prodData?.stock ?? 0);
      tx.update(prodRef, { stock: stock + qty });
    }

    // mark order canceled
    tx.update(orderRef, { estado: 'Cancelado' });
  });

  return { success: true };
});

// HTTP version of cancelOrder with CORS + Bearer token (for browsers that hit auth issues with callable)
export const cancelOrderHttp = functions.https.onRequest(async (req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const origin = req.headers.origin || '*';
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      if (req.method === 'OPTIONS') { res.status(204).end(); return; }
      if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
      const auth = req.get('Authorization') || '';
      if (!auth.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthenticated' });
        return;
      }
      const idToken = auth.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      const userId = decoded.uid;
      const { orderId } = req.body || {};
      if (!orderId) {
        res.status(400).json({ error: 'orderId requerido' });
        return;
      }
      const db = admin.firestore();
      await db.runTransaction(async (tx) => {
        const orderRef = db.doc(`orders/${orderId}`);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists) throw new functions.https.HttpsError('not-found', 'Order not found');
        const orderData = orderSnap.data() as Record<string, unknown> | undefined;
        if (!orderData) throw new functions.https.HttpsError('not-found', 'Order data missing');
        const ownerId = orderData.userId as string | undefined;
        if (ownerId !== userId) {
          const callerDoc = await admin.firestore().doc(`users/${userId}`).get();
            if (callerDoc.data()?.rol !== 'admin') {
              throw new functions.https.HttpsError('permission-denied', 'No autorizado');
            }
        }
        const items = (orderData.items as Array<Record<string, unknown>>) || [];
        for (const it of items) {
          const pid = it.productId as string;
          const qty = Number(it.cantidad ?? 0);
          const prodRef = db.doc(`products/${pid}`);
          const prodSnap = await tx.get(prodRef);
          if (!prodSnap.exists) continue;
          const prodData = prodSnap.data();
          const stock = Number(prodData?.stock ?? 0);
          tx.update(prodRef, { stock: stock + qty });
        }
        tx.update(orderRef, { estado: 'Cancelado' });
      });
  res.json({ success: true });
    } catch (err) {
      if (err instanceof functions.https.HttpsError) {
        const he = err as functions.https.HttpsError;
        const code = he.code === 'unauthenticated' ? 401 : he.code === 'permission-denied' ? 403 : he.code === 'not-found' ? 404 : 500;
        res.status(code).json({ error: he.message });
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: msg });
      }
    }
  });
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
