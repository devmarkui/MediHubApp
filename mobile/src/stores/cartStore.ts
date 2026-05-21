import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { LabTest } from '@/types/models';

type CartState = {
  items: LabTest[];
  add: (test: LabTest) => void;
  remove: (testId: number) => void;
  clear: () => void;
  total: () => number;
  has: (testId: number) => boolean;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (test) => {
        if (get().items.some((t) => t.id === test.id)) return;
        set({ items: [...get().items, test] });
      },
      remove: (testId) => set({ items: get().items.filter((t) => t.id !== testId) }),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, t) => sum + Number(t.price ?? 0), 0),
      has: (testId) => get().items.some((t) => t.id === testId),
    }),
    {
      name: 'medihub.cart.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
