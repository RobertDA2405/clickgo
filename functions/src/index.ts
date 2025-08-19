/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
  }

  const userId = context.auth.uid;
  const { items, envio, direccionEnvio, metodoPagoSimulado } = data;

  // Validar carrito
  if (!items || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Carrito vacío');
  }

  const db = admin.firestore();
  let subtotal = 0;
  const productsToUpdate = [];

  // Transacción para stock atómico
  await db.runTransaction(async (transaction) => {
    for (const item of items) {
      const productRef = db.doc(`products/${item.productId}`);
      const product = await transaction.get(productRef);
      if (!product.exists) {
        throw new functions.https.HttpsError('not-found', `Producto ${item.productId} no existe`);
      }
      const productData = product.data();
      if (productData.stock < item.cantidad) {
        throw new functions.https.HttpsError('failed-precondition', `Stock insuficiente para ${productData.nombre}`);
      }
      subtotal += productData.precio * item.cantidad;
      productsToUpdate.push({ ref: productRef, newStock: productData.stock - item.cantidad });
    }

    // Actualizar stocks
    for (const { ref, newStock } of productsToUpdate) {
      transaction.update(ref, { stock: newStock });
    }

    // Calcular total
    const envioCosto = envio.tipo === 'express' ? 10 : 5;  // Ejemplo costos
    const total = subtotal + envioCosto;

    // Crear order
    const orderRef = db.collection('orders').doc();
    transaction.set(orderRef, {
      userId,
      items: items.map((item: any) => ({
        productId: item.productId,
        nombre: item.nombre,
        precioUnit: item.precio,  // Usar precio real de DB
        cantidad: item.cantidad,
      })),
      subtotal,
      envio: { tipo: envio.tipo, costo: envioCosto },
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
export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || (await admin.firestore().doc(`users/${context.auth.uid}`).get()).data()?.rol !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Solo admin');
  }
  const { userId, rol } = data;
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
