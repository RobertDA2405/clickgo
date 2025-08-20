import { create } from 'zustand';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { useAuthStore } from './authStore'; // Asumiendo tienes esto

interface CartItem {
  productId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: async (newItem) => {  // Hice async para await DB
    const items = get().items;
    const existing = items.find(item => item.productId === newItem.productId);
    if (existing) {
      existing.cantidad += newItem.cantidad;
    } else {
      items.push(newItem);
    }
    set({ items });
    const user = useAuthStore.getState().user;
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), { items, actualizadoEn: new Date() });
    }
  },
  removeItem: async (productId) => {
    const items = get().items.filter(item => item.productId !== productId);
    set({ items });
    const user = useAuthStore.getState().user;
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), { items, actualizadoEn: new Date() });
    }
  },
  updateQuantity: async (productId, cantidad) => {
    if (cantidad < 1) return;
    const items = get().items.map(item => 
      item.productId === productId ? { ...item, cantidad } : item
    );
    set({ items });
    const user = useAuthStore.getState().user;
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), { items, actualizadoEn: new Date() });
    }
  },
  clearCart: async () => {
    set({ items: [] });
    const user = useAuthStore.getState().user;
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), { items: [], actualizadoEn: new Date() });
    }
  },
}));