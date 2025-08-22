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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = exports.createOrder = void 0;
const firebase_functions_1 = require("firebase-functions");
// removed unused imports: onRequest, logger
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.createOrder = functions.https.onCall(async (data, context) => {
    if (!context || !context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }
    const userId = context.auth.uid;
    const { items, envio, direccionEnvio, metodoPagoSimulado } = data || {};
    // Validar carrito
    if (!items || items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Carrito vacío');
    }
    const db = admin.firestore();
    let subtotal = 0;
    const productsToUpdate = [];
    // Transacción para stock atómico
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
        // Actualizar stocks
        for (const { ref, newStock } of productsToUpdate) {
            transaction.update(ref, { stock: newStock });
        }
        // Calcular total
        const envioCosto = (envio === null || envio === void 0 ? void 0 : envio.tipo) === 'express' ? 10 : 5; // Ejemplo costos
        const total = subtotal + envioCosto;
        // Crear order
        const orderRef = db.collection('orders').doc();
        transaction.set(orderRef, {
            userId,
            items: items.map((item) => ({
                productId: item.productId,
                nombre: item.nombre,
                precioUnit: item.precio, // Usar precio real de DB
                cantidad: item.cantidad,
            })),
            subtotal,
            envio: { tipo: (envio === null || envio === void 0 ? void 0 : envio.tipo) || 'standard', costo: envioCosto },
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