// src/stores/cartStore.ts
import { create } from 'zustand';
// Firestore is loaded lazily to keep the main bundle small
import { useAuthStore } from './authStore';

interface CartItem {
  productId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  // returns true if cart changed (item added/quantity updated)
  addItem: (item: CartItem) => Promise<boolean>;
  removeItem: (productId: string) => Promise<void>;
  // returns true if quantity was updated (may be capped to stock)
  updateQuantity: (productId: string, cantidad: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: async (newItem) => {
    const items = get().items.slice();
    const existing = items.find(item => item.productId === newItem.productId);

    // check stock
    try {
      const { getProductSnapshot, persistCartForUser } = await import('../firebase/lazyClient');
      const prodSnap = await getProductSnapshot(newItem.productId);
      let currentStock: number | undefined;
      if (prodSnap.exists()) {
        const data = prodSnap.data() as Record<string, unknown>;
        currentStock = typeof data.stock === 'number' ? data.stock : (typeof data.stock === 'string' ? Number(data.stock) : undefined);
      }

      const existingQty = existing ? existing.cantidad : 0;
      const desired = existingQty + newItem.cantidad;

      let finalQty = desired;
      if (typeof currentStock === 'number') {
        finalQty = Math.min(desired, currentStock);
      }

      if (existing) {
        if (finalQty === existingQty) {
          // no change
          return false;
        }
        existing.cantidad = finalQty;
      } else {
        items.push({ ...newItem, cantidad: finalQty });
      }

      set({ items });
      const user = useAuthStore.getState().user;
      if (user) {
        await persistCartForUser(user.uid, items as unknown[]);
      }
      return true;
    } catch {
      // If something goes wrong fetching stock, fallback to optimistic add (local only)
  const items = get().items;
  const existing = items.find(item => item.productId === newItem.productId);
      if (existing) {
        existing.cantidad += newItem.cantidad;
      } else {
        items.push(newItem);
      }
      set({ items });
      // Try to persist, but don't throw if it fails
      const user = useAuthStore.getState().user;
      if (user) {
        try {
          const { persistCartForUser } = await import('../firebase/lazyClient');
          await persistCartForUser(user.uid, items as unknown[]);
        } catch {
          // ignore persistence failure
        }
      }
      return true;
    }
  },
  removeItem: async (productId) => {
    const items = get().items.filter(item => item.productId !== productId);
    set({ items });
    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const { persistCartForUser } = await import('../firebase/lazyClient');
        await persistCartForUser(user.uid, items as unknown[]);
      } catch {
        // ignore persistence failure
      }
    }
  },
  updateQuantity: async (productId, cantidad) => {
    if (cantidad < 1) return false;
    try {
  const { getProductSnapshot, persistCartForUser } = await import('../firebase/lazyClient');
  const prodSnap = await getProductSnapshot(productId);
      let currentStock: number | undefined;
      if (prodSnap.exists()) {
        const data = prodSnap.data() as Record<string, unknown>;
        currentStock = typeof data.stock === 'number' ? data.stock : (typeof data.stock === 'string' ? Number(data.stock) : undefined);
      }

      let finalQty = cantidad;
      if (typeof currentStock === 'number') {
        finalQty = Math.min(cantidad, currentStock);
      }

      const items = get().items.map(item => 
        item.productId === productId ? { ...item, cantidad: finalQty } : item
      );
      set({ items });
      const user = useAuthStore.getState().user;
      if (user) {
        await persistCartForUser(user.uid, items as unknown[]);
      }
      return true;
  } catch {
      // optimistic fallback (local only)
      const items = get().items.map(item => 
        item.productId === productId ? { ...item, cantidad } : item
      );
      set({ items });
      const user = useAuthStore.getState().user;
      if (user) {
        try {
          const { persistCartForUser } = await import('../firebase/lazyClient');
          await persistCartForUser(user.uid, items as unknown[]);
        } catch {
          // ignore persistence failure
        }
      }
      return true;
    }
  },
  clearCart: async () => {
    set({ items: [] });
    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const { persistCartForUser } = await import('../firebase/lazyClient');
        await persistCartForUser(user.uid, []);
      } catch {
        // ignore persistence failure
      }
    }
  },
}));