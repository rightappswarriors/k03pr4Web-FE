import { create } from "zustand";

interface CartStore {
  count: number;
  setCount: (count: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  clearCart: () => set({ count: 0 }),
}));