// ...existing code...
/**
 * Script: migrate-add-nombreLower.ts
 * Usage (dry-run): npx ts-node --transpile-only scripts/migrate-add-nombreLower.ts --dry-run
 * Usage (real):    npx ts-node --transpile-only scripts/migrate-add-nombreLower.ts
 *
 * Este script usa el SDK cliente (firebase/web) y soporta:
 * - carga de firebaseConfig desde src/firebase/config (Vite) o VITE_FIREBASE_* env vars
 * - paginado por __name__ para evitar leer toda la colección
 * - batches por página (hasta PAGE_SIZE, <= 500)
 * - modo --dry-run (no escribe nada)
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  writeBatch,
  doc as docRef,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

const DRY = process.argv.includes('--dry-run');
const PAGE_SIZE = Number(process.env.BATCH_SIZE) || 500;

interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  [key: string]: unknown;
}

interface Product {
  nombre?: string;
  nombreLower?: string;
  [key: string]: unknown;
}

async function loadConfig(): Promise<FirebaseConfig> {
  try {
    // dynamic import works under ts-node or vite context
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import('../src/firebase/config');
    return mod.firebaseConfig as FirebaseConfig;
  } catch {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    } as FirebaseConfig;
  }
}

async function migrate() {
  const firebaseConfig = await loadConfig();
  if (!firebaseConfig || !firebaseConfig.projectId) {
    throw new Error('Firebase config not found. Set VITE_FIREBASE_* env vars or provide src/firebase/config.ts.');
  }

  initializeApp(firebaseConfig);
  const db = getFirestore();
  let last: QueryDocumentSnapshot | undefined = undefined;
  let totalProcessed = 0;
  let totalUpdated = 0;

  console.log(`Starting migration (dryRun=${DRY}) PAGE_SIZE=${PAGE_SIZE}`);

  while (true) {
    let q = query(collection(db, 'products'), orderBy('__name__'), limit(PAGE_SIZE));
    if (last) q = query(collection(db, 'products'), orderBy('__name__'), startAfter(last), limit(PAGE_SIZE));

    const snap = await getDocs(q);
    // create a batch for this page
    const batch = writeBatch(db);
    let pageUpdated = 0;

    for (const d of snap.docs) {
      totalProcessed++;
      const data = d.data() as Product;
      const nombre = typeof data?.nombre === 'string' ? data.nombre : '';
      const nombreLower = nombre.toLowerCase();

      if (!data?.nombreLower || data.nombreLower !== nombreLower) {
        if (!DRY) batch.update(docRef(db, 'products', d.id), { nombreLower });
        pageUpdated++;
        totalUpdated++;
      }
    }

    if (!DRY && pageUpdated > 0) {
      try {
        await batch.commit();
      } catch (err) {
        console.error('Batch commit failed for a page:', err);
        throw err;
      }
    }

    if (snap.docs.length === 0) break;
    last = snap.docs[snap.docs.length - 1];

    console.log(`Processed page: docs=${snap.size} pageUpdated=${pageUpdated} totalProcessed=${totalProcessed} totalUpdated=${totalUpdated}`);

    if (snap.size < PAGE_SIZE) break;
  }

  console.log(`Migration finished. processed=${totalProcessed} updated=${totalUpdated} dryRun=${DRY}`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
// ...existing code...