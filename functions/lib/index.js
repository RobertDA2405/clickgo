"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.setUserRole = exports.createOrderHttp = exports.createOrder = void 0;
const firebase_functions_1 = require("firebase-functions");
// removed unused imports: onRequest, logger
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
admin.initializeApp();
// Use the CORS middleware to reliably handle preflight requests and set
// Access-Control-Allow-* headers.
const corsMiddleware = (0, cors_1.default)({ origin: true, methods: ['POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] });
// Helper which performs the transactional order creation for a given userId and payload.
async function performCreateOrder(userId, data) {
    const { items, envio, direccionEnvio, metodoPagoSimulado } = data || {};
    if (!items || items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Carrito vacío');
    }
    const db = admin.firestore();
    let subtotal = 0;
    const productsToUpdate = [];
    await db.runTransaction(async (transaction) => {
        var _a, _b;
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
            const stock = Number((_a = productData.stock) !== null && _a !== void 0 ? _a : 0);
            const precio = Number((_b = productData.precio) !== null && _b !== void 0 ? _b : 0);
            if (stock < item.cantidad) {
                const pd = productData;
                const nombre = typeof pd.nombre === 'string' ? pd.nombre : item.productId;
                throw new functions.https.HttpsError('failed-precondition', `Stock insuficiente para ${nombre}`);
            }
            subtotal += precio * item.cantidad;
            productsToUpdate.push({ ref: productRef, newStock: stock - item.cantidad });
        }
        for (const { ref, newStock } of productsToUpdate) {
            transaction.update(ref, { stock: newStock });
        }
        const envioCosto = (envio === null || envio === void 0 ? void 0 : envio.tipo) === 'express' ? 10 : 5;
        const total = subtotal + envioCosto;
        const orderRef = db.collection('orders').doc();
        const creadoEnISO = admin.firestore.Timestamp.now().toDate().toISOString();
        transaction.set(orderRef, {
            userId,
            items: items.map((item) => ({
                productId: item.productId,
                nombre: item.nombre,
                precioUnit: item.precio,
                cantidad: item.cantidad,
            })),
            subtotal,
            envio: { tipo: (envio === null || envio === void 0 ? void 0 : envio.tipo) || 'standard', costo: envioCosto },
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
function isCallableContext(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    const auth = obj['auth'];
    if (typeof auth !== 'object' || auth === null)
        return false;
    const uid = auth['uid'];
    return typeof uid === 'string';
}
exports.createOrder = functions.https.onCall(async (data, context) => {
    if (!isCallableContext(context)) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }
    const userId = context.auth.uid;
    return performCreateOrder(userId, data);
});
// HTTP wrapper that supports CORS preflight and accepts a Bearer ID token in Authorization header.
exports.createOrderHttp = functions.https.onRequest(async (req, res) => {
    // Delegate CORS handling to the middleware which will handle OPTIONS and
    // set the appropriate Access-Control-Allow-* headers based on the request.
    corsMiddleware(req, res, async () => {
        var _a;
        try {
            const auth = req.get('Authorization') || '';
            if (!auth.startsWith('Bearer ')) {
                res.status(401).json({ error: 'unauthenticated' });
                return;
            }
            const idToken = auth.split('Bearer ')[1];
            const decoded = await admin.auth().verifyIdToken(idToken);
            const userId = decoded.uid;
            const data = req.body;
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
                const itemsArr = Array.isArray(data === null || data === void 0 ? void 0 : data.items) ? data.items : [];
                const subtotal = itemsArr.reduce((s, it) => s + (Number(it.precio || 0) * Number(it.cantidad || 0)), 0);
                const envioCosto = ((_a = data === null || data === void 0 ? void 0 : data.envio) === null || _a === void 0 ? void 0 : _a.tipo) === 'express' ? 10 : 5;
                const total = subtotal + envioCosto;
                const ordersRef = db.collection('orders');
                const snap = await ordersRef.where('userId', '==', userId).where('total', '==', total).orderBy('creadoEn', 'desc').limit(1).get();
                if (!snap.empty) {
                    const doc = snap.docs[0];
                    await doc.ref.update({ creadoEnISO: now.toDate().toISOString() });
                }
            }
            catch (e) {
                // best-effort only
                console.warn('Could not update creadoEnISO', e);
            }
            res.json(result);
        }
        catch (err) {
            // Mirror HttpsError codes where possible
            if (err instanceof functions.https.HttpsError) {
                const he = err;
                const code = he.code === 'unauthenticated' ? 401 : (he.code === 'invalid-argument' ? 400 : 500);
                res.status(code).json({ error: he.message });
            }
            else {
                console.error('createOrderHttp error', err);
                const msg = err instanceof Error ? err.message : String(err);
                res.status(500).json({ error: msg });
            }
        }
    });
});
// Opcional: setUserRole
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.setUserRole = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context || !context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }
    const callerDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
    if (((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.rol) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Solo admin');
    }
    const { userId, rol } = data || {};
    if (!userId || !rol)
        throw new functions.https.HttpsError('invalid-argument', 'Parámetros faltantes');
    await admin.firestore().doc(`users/${userId}`).update({ rol });
    return { success: true };
});
// Cancel an order: increment stock atomically and mark order as canceled
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.cancelOrder = functions.https.onCall(async (data, context) => {
    if (!context || !context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }
    const userId = context.auth.uid;
    const { orderId } = data || {};
    if (!orderId)
        throw new functions.https.HttpsError('invalid-argument', 'orderId requerido');
    const db = admin.firestore();
    await db.runTransaction(async (tx) => {
        var _a, _b, _c;
        const orderRef = db.doc(`orders/${orderId}`);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists)
            throw new functions.https.HttpsError('not-found', 'Order not found');
        const orderData = orderSnap.data();
        if (!orderData)
            throw new functions.https.HttpsError('not-found', 'Order data missing');
        // ensure the requester is the owner of the order (or admin)
        const ownerId = orderData.userId;
        if (ownerId !== userId) {
            // allow admin to cancel via role check
            const callerDoc = await admin.firestore().doc(`users/${userId}`).get();
            if (((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.rol) !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'No autorizado');
            }
        }
        const items = orderData.items || [];
        // increment stock for each item
        for (const it of items) {
            const pid = it.productId;
            const qty = Number((_b = it.cantidad) !== null && _b !== void 0 ? _b : 0);
            const prodRef = db.doc(`products/${pid}`);
            const prodSnap = await tx.get(prodRef);
            if (!prodSnap.exists)
                continue; // skip if product missing
            const prodData = prodSnap.data();
            const stock = Number((_c = prodData === null || prodData === void 0 ? void 0 : prodData.stock) !== null && _c !== void 0 ? _c : 0);
            tx.update(prodRef, { stock: stock + qty });
        }
        // mark order canceled
        tx.update(orderRef, { estado: 'Cancelado' });
    });
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
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10 });
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
//# sourceMappingURL=index.js.map