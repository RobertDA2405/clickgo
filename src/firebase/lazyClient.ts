// Lazy Firebase initializer: initializes Firebase only when requested to avoid pulling the SDK into the main bundle.
import type {
  Firestore,
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Query,
  CollectionReference,
  Transaction,
  QueryConstraint,
} from 'firebase/firestore';
// no direct lite types here anymore
import type { Functions } from 'firebase/functions';
import type { Auth } from 'firebase/auth';

let _client: { db: Firestore | null; auth: Auth | null; functions: Functions | null } | null = null;

const firebaseConfig = {
  apiKey: "AIzaSyA9yLXADpsnYUif1tD8DPAiHWGVdK9dDho",
  authDomain: "clickgo-digital.firebaseapp.com",
  projectId: "clickgo-digital",
  storageBucket: "clickgo-digital.firebasestorage.app",
  messagingSenderId: "276535877954",
  appId: "1:276535877954:web:915edf603928e90f4468db",
  measurementId: "G-M4E0BQ3P87",
};

export async function getClient() {
  if (_client) return _client;

  const [{ initializeApp }, { getFirestore }, { getAuth }, { getFunctions }] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
    import('firebase/auth'),
    import('firebase/functions'),
  ]);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app) as Auth;
  const functions = getFunctions(app);

  _client = { db, auth, functions };
  return _client;
}

export async function getDb(): Promise<Firestore> {
  const c = await getClient();
  if (!c || !c.db) throw new Error('Firebase DB not initialized');
  return c.db;
}

export async function getAuthClient(): Promise<Auth> {
  const c = await getClient();
  if (!c || !c.auth) throw new Error('Firebase Auth not initialized');
  return c.auth;
}

export async function getFunctionsClient(): Promise<Functions> {
  const c = await getClient();
  if (!c || !c.functions) throw new Error('Firebase Functions not initialized');
  return c.functions;
}

// Convenience helper to fetch a product by id and return a normalized record
export async function getProductById(id: string) {
  const db = await getDb();
  // Use full firestore API here to ensure compatibility with the initialized db instance
  const fs = await import('firebase/firestore') as typeof import('firebase/firestore');
  const ref = fs.doc(db as Firestore, 'products', id) as DocumentReference;
  const snap = await fs.getDoc(ref) as DocumentSnapshot;
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    id: snap.id,
    nombre: typeof data.nombre === 'string' ? data.nombre : '',
    descripcion: typeof data.descripcion === 'string' ? data.descripcion : '',
    precio: typeof data.precio === 'number' ? data.precio : (typeof data.precio === 'string' ? Number(data.precio) || 0 : 0),
    imagenes: Array.isArray(data.imagenes) ? data.imagenes.filter((i): i is string => typeof i === 'string') : [],
    stock: typeof data.stock === 'number' ? data.stock : (typeof data.stock === 'string' ? Number(data.stock) || 0 : undefined),
  };
}

// Return the raw DocumentSnapshot for a product (caller can inspect .exists() and .data())
export async function getProductSnapshot(id: string) {
  const db = await getDb();
  const fs = await import('firebase/firestore') as typeof import('firebase/firestore');
  const ref = fs.doc(db as Firestore, 'products', id) as DocumentReference;
  const snap = await fs.getDoc(ref) as DocumentSnapshot;
  return snap;
}

// Persist a cart document for a user
export async function persistCartForUser(uid: string, items: unknown[]) {
  const db = await getDb();
  const fs = await import('firebase/firestore') as typeof import('firebase/firestore');
  const ref = fs.doc(db as Firestore, 'carts', uid) as DocumentReference;
  await fs.setDoc(ref, { items, actualizadoEn: new Date() });
}

// Atomically decrement stock for a list of items. Throws if insufficient stock for any product.
export async function decrementStockTransaction(items: { productId: string; cantidad: number }[]) {
  const db = await getDb();
  const fs = await import('firebase/firestore') as typeof import('firebase/firestore');
  return await fs.runTransaction(db as Firestore, async (tx: Transaction) => {
    // load all product refs
    const refs = items.map(it => fs.doc(db as Firestore, 'products', it.productId) as DocumentReference);
    const snaps = await Promise.all(refs.map(r => fs.getDoc(r) as Promise<DocumentSnapshot>));
    // verify stock
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const snap = snaps[i];
      if (!snap.exists()) throw new Error(`Producto no encontrado: ${it.productId}`);
      const data = snap.data() as Record<string, unknown>;
      const stock = typeof data.stock === 'number' ? data.stock : (typeof data.stock === 'string' ? Number(data.stock) : 0);
      if (stock < it.cantidad) throw new Error(`Stock insuficiente para ${it.productId}`);
    }
    // apply decrements
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
  const ref = refs[i];
  const snap = snaps[i];
      const data = snap.data() as Record<string, unknown>;
      const stock = typeof data.stock === 'number' ? data.stock : (typeof data.stock === 'string' ? Number(data.stock) : 0);
      tx.update(ref, { stock: stock - it.cantidad });
    }
    return true;
  });
}

// Atomically increment stock for a list of items (e.g., order cancellation)
export async function incrementStockTransaction(items: { productId: string; cantidad: number }[]) {
  const db = await getDb();
  const fs = await import('firebase/firestore') as typeof import('firebase/firestore');
  return await fs.runTransaction(db as Firestore, async (tx: Transaction) => {
    const refs = items.map(it => fs.doc(db as Firestore, 'products', it.productId) as DocumentReference);
    const snaps = await Promise.all(refs.map(r => fs.getDoc(r) as Promise<DocumentSnapshot>));
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const snap = snaps[i];
      if (!snap.exists()) throw new Error(`Producto no encontrado: ${it.productId}`);
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const ref = refs[i];
      const snap = snaps[i];
      const data = snap.data() as Record<string, unknown>;
      const stock = typeof data.stock === 'number' ? data.stock : (typeof data.stock === 'string' ? Number(data.stock) : 0);
      tx.update(ref, { stock: stock + it.cantidad });
    }
    return true;
  });
}

// --- Typed higher-level helpers (callers should use these instead of raw firestore imports) ---
export type OrderItem = { productId: string; nombre: string; precio: number; cantidad: number };
export type Order = { id: string; total: number; estado: string; items: OrderItem[]; creadoEn: string };

export async function queryOrdersForUser(userId: string): Promise<Order[]> {
  const db = await getDb();
  const fs = await import('firebase/firestore') as typeof import('firebase/firestore');
  const col = fs.collection(db as Firestore, 'orders') as CollectionReference;
  const q = fs.query(col, fs.where('userId', '==', userId));
  const snapshot = await fs.getDocs(q as Query);
  return (snapshot.docs as QueryDocumentSnapshot[]).map((d) => {
    const raw = d.data() as Record<string, unknown>;
    const creadoRaw = raw['creadoEn'] as unknown;
    let creadoEn = 'Desconocida';
    if (creadoRaw && typeof (creadoRaw as { toDate?: unknown }).toDate === 'function') {
      // Firestore Timestamp-like (has toDate())
      try {
        const date = (creadoRaw as { toDate: () => Date }).toDate();
        creadoEn = date.toLocaleString();
      } catch {
        creadoEn = 'Desconocida';
      }
    } else if (creadoRaw && typeof (creadoRaw as { seconds?: number }).seconds === 'number') {
      // Possible server timestamp represented with seconds
      const secs = (creadoRaw as { seconds: number }).seconds;
      creadoEn = new Date(secs * 1000).toLocaleString();
    } else if (typeof creadoRaw === 'string') {
      creadoEn = creadoRaw;
    }

    const total = typeof raw['total'] === 'number' ? raw['total'] as number : (typeof raw['total'] === 'string' ? Number(raw['total']) || 0 : 0);
    const estado = typeof raw['estado'] === 'string' ? raw['estado'] : 'Pendiente';
    const items = Array.isArray(raw['items']) ? (raw['items'] as OrderItem[]) : [];

    return {
      id: d.id,
      total,
      estado,
      items,
      creadoEn,
    } as Order;
  });
}

export async function getCartForUser(uid: string): Promise<unknown[]> {
  const db = await getDb();
  const fs = await import('firebase/firestore') as typeof import('firebase/firestore');
  const ref = fs.doc(db as Firestore, 'carts', uid) as DocumentReference;
  const snap = await fs.getDoc(ref) as DocumentSnapshot;
  if (!snap.exists()) return [];
  const data = snap.data() as Record<string, unknown>;
  return (data.items as unknown[]) || [];
}

export type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagenes?: string[];
  stock?: number;
  activo?: boolean;
  categoria?: string;
};

export async function queryProductsPage(
  categoria?: string,
  filters?: { minPrice?: number; maxPrice?: number; inStock?: boolean },
  search?: string,
  pageDoc?: unknown,
) {
  const db = await getDb();
  const fs = await import('firebase/firestore/lite') as typeof import('firebase/firestore/lite');
  const { collection, query, where, orderBy, limit, startAfter, getDocs } = fs;
  const col = collection(db as Firestore, 'products') as CollectionReference;
  const parts: QueryConstraint[] = [];
  if (categoria) parts.push(where('categoria', '==', categoria));
  if (filters?.minPrice !== undefined) parts.push(where('precio', '>=', filters.minPrice));
  if (filters?.maxPrice !== undefined) parts.push(where('precio', '<=', filters.maxPrice));
  if (filters?.inStock) parts.push(where('stock', '>', 0));

  let q: Query;
  if (search && search.trim().length > 0) {
    const s = search.trim().toLowerCase();
    parts.push(where('nombreLower', '>=', s));
    parts.push(where('nombreLower', '<=', s + '\uf8ff'));
    q = query(col, ...parts, orderBy('nombreLower', 'asc'), limit(12));
  } else {
    q = query(col, ...parts, orderBy('creadoEn', 'desc'), limit(12));
  }

  if (pageDoc) {
    q = query(q, startAfter(pageDoc as QueryDocumentSnapshot));
  }

  const snap = await getDocs(q as Query);
  let items: Product[] = (snap.docs as QueryDocumentSnapshot[]).map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) } as Product));
  // Treat missing 'activo' as active; filter out explicit inactive docs
  items = items.filter(it => it.activo !== false);
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] as QueryDocumentSnapshot : null;
  return { items, lastDoc };
}

// --- Cloud Functions wrappers ---
export async function createOrderViaFunction(payload: { items: OrderItem[]; envio?: Record<string, unknown>; direccionEnvio?: Record<string, unknown>; metodoPagoSimulado?: Record<string, unknown> }) {
  // If running in a browser environment prefer calling the HTTP wrapper which handles CORS preflight.
  if (typeof window !== 'undefined') {
    try {
      const auth = await getAuthClient();
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('https://us-central1-clickgo-digital.cloudfunctions.net/createOrderHttp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error || `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }
      return await res.json();
    } catch (err: unknown) {
      const maybe = (err as { message?: string } | undefined) || {};
      throw new Error(maybe.message || String(err));
    }
  }

  // fallback to callable when not in browser (e.g., server-side callers)
  const functionsClient = await getFunctionsClient();
  const fs = await import('firebase/functions') as typeof import('firebase/functions');
  const callable = fs.httpsCallable(functionsClient as unknown as Functions, 'createOrder');
  try {
    const res = await callable(payload as Record<string, unknown>);
    return res.data as Record<string, unknown>;
  } catch (err: unknown) {
    const maybe = (err as { code?: string; status?: string; message?: string; details?: unknown } | undefined) || {};
    const code = maybe.code || maybe.status || 'internal';
    const message = maybe.message || (typeof maybe.details === 'string' ? maybe.details : JSON.stringify(maybe.details) || String(err));
    throw new Error(`${code}: ${message}`);
  }
}

export async function cancelOrderViaFunction(orderId: string) {
  // Try HTTP endpoint first for consistent auth (Bearer token) & CORS
  if (typeof window !== 'undefined') {
    try {
      const auth = await getAuthClient();
  // Refrescar token para evitar 401 por token expirado
  const token = await auth.currentUser?.getIdToken(true);
      if (!token) throw new Error('No autenticado');
      const res = await fetch('https://us-central1-clickgo-digital.cloudfunctions.net/cancelOrderHttp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || res.statusText);
      }
      return await res.json();
    } catch (err) {
      // fallback to callable below
      console.warn('HTTP cancel fallback to callable', err);
    }
  }
  const functionsClient = await getFunctionsClient();
  const fs = await import('firebase/functions') as typeof import('firebase/functions');
  const callable = fs.httpsCallable(functionsClient as unknown as Functions, 'cancelOrder');
  const res = await callable({ orderId } as Record<string, unknown>);
  return res.data as Record<string, unknown>;
}
