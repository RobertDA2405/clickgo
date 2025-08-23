/**
 * Script to seed categories collection with a list of categories.
 * Usage: node -r ts-node/register scripts/seed-categories.ts
 */
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

async function loadConfig(): Promise<Record<string, string | undefined>> {
  try {
    const mod = await import('../src/firebase/config');
    return mod.firebaseConfig;
  } catch {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }
}

async function initDb() {
  const firebaseConfig = await loadConfig();
  if (!firebaseConfig || !firebaseConfig.projectId) {
    throw new Error('Firebase config not found in env or src/firebase/config.ts. Set VITE_FIREBASE_* env vars or provide config file.');
  }
  initializeApp(firebaseConfig as FirebaseOptions);
  return getFirestore();
}

const categories = [
  'celulares',
  'electronica',
  'accesorios',
  'hogar',
  'videojuegos',
  'computadoras',
  'audio',
  'smartwatch',
  'fotografia',
];

async function seed() {
  const db = await initDb();
  for (const nombre of categories) {
    await addDoc(collection(db, 'categories'), { nombre, createdAt: new Date() });
    console.log('Added', nombre);
  }
  console.log('Categories seeded');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
