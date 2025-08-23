import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface CartItem {
  productId: string;
  cantidad: number;
  // Más fields
}

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (user) {
      let unsub: (() => void) | undefined;
      (async () => {
        const { getDb } = await import('../firebase/lazyClient');
        const db = await getDb();
        const { doc, onSnapshot } = await import('firebase/firestore');
        const cartRef = doc(db, 'carts', user.uid);
        unsub = onSnapshot(cartRef, (snap) => {
          const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
          if (exists) {
            const raw = typeof snap.data === 'function' ? snap.data() : undefined;
            const data = (raw ?? {}) as Record<string, unknown>;
            setCart(((data.items as CartItem[]) || []));
          }
        });
      })();

      return () => {
        if (unsub) unsub();
      };
    }
  }, [user]);

  const addToCart = async (item: CartItem) => {
      if (user) {
        const { getDb } = await import('../firebase/lazyClient');
        const db = await getDb();
        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const cartRef = doc(db, 'carts', user.uid);
        const snap = await getDoc(cartRef);
        const existing = snap.exists() ? (snap.data()?.items as CartItem[]) || [] : [];
        const items = [...existing, item];
        await setDoc(cartRef, { items, actualizadoEn: new Date() });
      }
  };

  // Más funcs: remove, update

  return { cart, addToCart };
};