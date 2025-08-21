// src/firebase/client.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyA9yLXADpsnYUif1tD8DPAiHWGVdK9dDho",
  authDomain: "clickgo-digital.firebaseapp.com",
  projectId: "clickgo-digital",
  storageBucket: "clickgo-digital.firebasestorage.app",
  messagingSenderId: "276535877954",
  appId: "1:276535877954:web:915edf603928e90f4468db",
  measurementId: "G-M4E0BQ3P87",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, auth, functions };
