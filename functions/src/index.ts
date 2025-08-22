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

admin.initializeApp();

type OrderItem = { productId: string; nombre: string; precio: number; cantidad: number };

type CreateOrderRequest = {
  items: OrderItem[];
  envio?: { tipo?: 'express' | string };
  direccionEnvio?: unknown;
  metodoPagoSimulado?: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createOrder = functions.https.onCall(async (data: any, context: any) => {
  if (!context || !context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
  }

  const userId = context.auth.uid;
  const { items, envio, direccionEnvio, metodoPagoSimulado } = data || {} as CreateOrderRequest;

  // Validar carrito
  if (!items || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Carrito vacío');
  }

  const db = admin.firestore();
  let subtotal = 0;
  const productsToUpdate: { ref: admin.firestore.DocumentReference; newStock: number }[] = [];

  // Transacción para stock atómico
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

    // Actualizar stocks
    for (const { ref, newStock } of productsToUpdate) {
      transaction.update(ref, { stock: newStock });
    }

    // Calcular total
  const envioCosto = envio?.tipo === 'express' ? 10 : 5;  // Ejemplo costos
    const total = subtotal + envioCosto;

    // Crear order
    const orderRef = db.collection('orders').doc();
    transaction.set(orderRef, {
      userId,
      items: items.map((item: OrderItem) => ({
        productId: item.productId,
        nombre: item.nombre,
        precioUnit: item.precio,  // Usar precio real de DB
        cantidad: item.cantidad,
      })),
      subtotal,
      envio: { tipo: envio?.tipo || 'standard', costo: envioCosto },
      total,
      direccionEnvio,
      metodoPagoSimulado,
      estado: 'pendiente',
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return { success: true };
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
