// src/stores/authStore.ts
import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/client";

interface User {
  uid: string;
  nombre: string;
  email: string;
  rol: "user" | "admin";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  register: async (email, password, nombre) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const userData: User = { uid: user.uid, nombre, email, rol: "user" };
    await setDoc(doc(db, "users", user.uid), { ...userData, creadoEn: new Date() });
    set({ user: userData });
  },

  login: async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      set({ user: userDoc.data() as User });
    } else {
      // fallback por si el doc no existe
      set({ user: { uid: user.uid, nombre: "", email: user.email || "", rol: "user" } });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));

// Listener global para mantener estado sincronizado
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      useAuthStore.setState({ user: userDoc.data() as User, loading: false });
    } else {
      useAuthStore.setState({
        user: {
          uid: firebaseUser.uid,
          nombre: "",
          email: firebaseUser.email || "",
          rol: "user",
        },
        loading: false,
      });
    }
  } else {
    useAuthStore.setState({ user: null, loading: false });
  }
});
