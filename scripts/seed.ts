import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';

initializeApp(firebaseConfig);
const db = getFirestore();

async function seedProducts() {
  const products = [
    { nombre: 'Producto 1', precio: 10, stock: 100, descripcion: 'Desc', categoria: 'cat1', imagenes: [], activo: true, creadoEn: new Date() },
    // Más
  ];
  for (const p of products) {
  await addDoc(collection(db, 'products'), { ...p, nombreLower: (p.nombre || '').toLowerCase() });
  }
  console.log('Seeded');
}

seedProducts();