// firebase/client.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9yLXADpsnYUif1tD8DPAiHWGVdK9dDho",
  authDomain: "clickgo-digital.firebaseapp.com",
  projectId: "clickgo-digital",
  storageBucket: "clickgo-digital.firebasestorage.app",
  messagingSenderId: "276535877954",
  appId: "1:276535877954:web:915edf603928e90f4468db",
  measurementId: "G-M4E0BQ3P87"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Analytics solo si está soportado
let analytics: any = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

const db = getFirestore(app);
const auth = getAuth(app);

// Función para obtener productos de Firestore
export const getProducts = async () => {
  try {
    const productsCol = collection(db, "products");
    const productsSnapshot = await getDocs(productsCol);
    const productsList = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return productsList;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

export { db, auth, analytics };
