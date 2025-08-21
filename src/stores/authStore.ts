// src/stores/authStore.ts
import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
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
  error: string | null;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  register: async (email, password, nombre) => {
    set({ loading: true, error: null });
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const userData: User = { uid: user.uid, nombre, email, rol: "user" };
      await setDoc(doc(db, "users", user.uid), { ...userData, creadoEn: new Date() });
      set({ user: userData, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        set({ user: userDoc.data() as User, loading: false });
      } else {
        set({
          user: { uid: user.uid, nombre: "", email: user.email || "", rol: "user" },
          loading: false,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, loading: false });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  deleteAccount: async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid));
        await deleteUser(currentUser);
        set({ user: null });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        set({ error: message });
      }
    }
  },
}));

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
