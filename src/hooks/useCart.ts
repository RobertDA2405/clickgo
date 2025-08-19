import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
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
      const cartRef = doc(db, 'carts', user.uid);
      const unsubscribe = onSnapshot(cartRef, (snap) => {
        if (snap.exists()) {
          setCart(snap.data().items || []);
        }
      });
      return unsubscribe;
    }
  }, [user]);

  const addToCart = async (item: CartItem) => {
    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      // Lógica para agregar/update
      await updateDoc(cartRef, { items: [...cart, item] });
    }
  };

  // Más funcs: remove, update

  return { cart, addToCart };
};