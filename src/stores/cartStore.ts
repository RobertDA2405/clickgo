import { create } from 'zustand';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/client'; // Asegúrate de tener esto
import { useAuthStore } from './authStore'; // Si tienes auth store

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
  addItem: (newItem) => {
    const items = get().items;
    const existing = items.find(item => item.productId === newItem.productId);
    if (existing) {
      existing.cantidad += newItem.cantidad;
    } else {
      items.push(newItem);
    }
    set({ items });
    // Persiste en Firestore (después de auth)
    const user = useAuthStore.getState().user;
    if (user) {
      setDoc(doc(db, 'carts', user.uid), { items, actualizadoEn: new Date() });
    }
  },
  removeItem: (productId) => {
    const items = get().items.filter(item => item.productId !== productId);
    set({ items });
    // Actualiza DB similar
  },
  updateQuantity: (productId, cantidad) => {
    const items = get().items.map(item => 
      item.productId === productId ? { ...item, cantidad } : item
    );
    set({ items });
    // Actualiza DB
  },
  clearCart: () => set({ items: [] }),
}));

// Listener para real-time sync (en useEffect global o App)