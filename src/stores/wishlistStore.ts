import { create } from 'zustand';
import type { StateCreator } from 'zustand';

const WISH_KEY = 'clickgo:wishlist';

type WishlistState = {
  items: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isFavorite: (id: string) => boolean;
};

const readInitial = (): string[] => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(WISH_KEY) || '[]';
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

const initializer: StateCreator<WishlistState> = (set, get) => ({
  items: readInitial(),
  add: (id: string) => {
    const cur = get().items;
    if (cur.includes(id)) return;
    const next = [...cur, id];
    try { localStorage.setItem(WISH_KEY, JSON.stringify(next)); } catch { void 0; }
    set({ items: next });
  },
  remove: (id: string) => {
    const next = get().items.filter((i: string) => i !== id);
    try { localStorage.setItem(WISH_KEY, JSON.stringify(next)); } catch { void 0; }
    set({ items: next });
  },
  toggle: (id: string) => {
    const cur = get().items;
    if (cur.includes(id)) get().remove(id);
    else get().add(id);
  },
  clear: () => {
    try { localStorage.setItem(WISH_KEY, JSON.stringify([])); } catch { void 0; }
    set({ items: [] });
  },
  isFavorite: (id: string) => get().items.includes(id),
});

export const useWishlistStore = create<WishlistState>(initializer);

export default useWishlistStore;
