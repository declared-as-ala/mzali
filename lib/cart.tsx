'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const items = [...get().items];
        const i = items.findIndex(
          (x) => x.productId === item.productId && (x.bundleId ?? '') === (item.bundleId ?? ''),
        );
        if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + item.qty };
        else items.push(item);
        set({ items });
      },
      setQty: (productId, qty) =>
        set({
          items: get().items.map((x) =>
            x.productId === productId ? { ...x, qty: Math.max(1, qty) } : x,
          ),
        }),
      remove: (productId) => set({ items: get().items.filter((x) => x.productId !== productId) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'mzali-cart' },
  ),
);

// Derived selectors — use in components instead of inline calls to avoid render loops
export function selectSubtotal(items: CartItem[]): number {
  return items.reduce((s, x) => s + x.price * x.qty, 0);
}
export function selectCount(items: CartItem[]): number {
  return items.reduce((s, x) => s + x.qty, 0);
}
