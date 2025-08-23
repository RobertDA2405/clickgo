// src/stores/authStore.ts
import { create } from "zustand";
// Firebase is loaded lazily via lazyClient to avoid bundling the SDK in the app shell

interface User {
  uid: string;
  nombre: string;
  email: string;
  rol: "user" | "admin";
  photoURL?: string; // optional avatar
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: { nombre?: string; photoFile?: File | null }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  register: async (email, password, nombre) => {
    set({ loading: true, error: null });
    try {
      const { getAuthClient, getDb } = await import('../firebase/lazyClient');
      const auth = await getAuthClient();
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { setDoc, doc } = await import('firebase/firestore');
      const db = await getDb();

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
  const userData: User = { uid: user.uid, nombre, email, rol: 'user', photoURL: user.photoURL || undefined };
      await setDoc(doc(db, 'users', user.uid), { ...userData, creadoEn: new Date() });
      set({ user: userData, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { getAuthClient, getDb } = await import('../firebase/lazyClient');
      const auth = await getAuthClient();
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { getDoc, doc } = await import('firebase/firestore');
      const db = await getDb();

      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) set({ user: userDoc.data() as User, loading: false });
      else {
        set({ user: { uid: user.uid, nombre: '', email: user.email || '', rol: 'user', photoURL: user.photoURL || undefined }, loading: false });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, loading: false });
    }
  },

  updateProfile: async ({ nombre, photoFile }: { nombre?: string; photoFile?: File | null }) => {
    set({ loading: true, error: null });
    try {
      const { getAuthClient, getDb, getClient } = await import('../firebase/lazyClient');
      const auth = await getAuthClient();
      const db = await getDb();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No autenticado');

      let photoURL: string | undefined = undefined;
      if (photoFile) {
        const storageMod = await import('firebase/storage');
        const storage = storageMod.getStorage((await getClient()).auth?.app);
        const avatarRef = storageMod.ref(storage, `avatars/${currentUser.uid}`);
        await storageMod.uploadBytes(avatarRef, photoFile);
        photoURL = await storageMod.getDownloadURL(avatarRef);
      }

      const { updateProfile: fbUpdateProfile } = await import('firebase/auth');
      await fbUpdateProfile(currentUser, {
        displayName: nombre !== undefined ? nombre : currentUser.displayName || undefined,
        photoURL: photoURL || currentUser.photoURL || undefined,
      });

      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', currentUser.uid);
      const payload: Record<string, unknown> = {};
      if (nombre !== undefined) payload['nombre'] = nombre;
      if (photoURL) payload['photoURL'] = photoURL;
      if (Object.keys(payload).length > 0) await updateDoc(userRef, payload);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) set({ user: userDoc.data() as User, loading: false });
      else set({ loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, loading: false });
    }
  },

  logout: async () => {
    try {
  const { getAuthClient } = await import('../firebase/lazyClient');
  const auth = await getAuthClient();
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
    } finally {
      set({ user: null });
    }
  },

  deleteAccount: async () => {
    try {
    const { getAuthClient, getDb } = await import('../firebase/lazyClient');
    const auth = await getAuthClient();
    const db = await getDb();
    const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const { deleteUser } = await import('firebase/auth');
          const { deleteDoc, doc } = await import('firebase/firestore');
          await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);
          set({ user: null });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          set({ error: message });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },
}));

// Initialize auth state listener lazily to avoid importing firebase at module load
(async () => {
  try {
    const { getAuthClient, getDb } = await import('../firebase/lazyClient');
    const auth = await getAuthClient();
    const db = await getDb();
    const { onAuthStateChanged } = await import('firebase/auth');
    const { getDoc, doc } = await import('firebase/firestore');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthStateChanged(auth as any, async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userDoc = await getDoc(doc(db as any, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            useAuthStore.setState({ user: userDoc.data() as User, loading: false });
          } else {
            useAuthStore.setState({
              user: {
                uid: firebaseUser.uid,
                nombre: "",
                email: firebaseUser.email || "",
                rol: "user",
                photoURL: firebaseUser.photoURL || undefined,
              },
              loading: false,
            });
          }
        } catch {
          useAuthStore.setState({ user: null, loading: false });
        }
      } else {
        useAuthStore.setState({ user: null, loading: false });
      }
    });
  } catch {
    // ignore initialization errors — auth will initialize when first used
  }
})();
