'use client';

import { create } from 'zustand';

interface WishlistState {
  ids: Set<string>;
  hydrated: boolean;
  setIds: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  ids: new Set<string>(),
  hydrated: false,
  setIds: (ids) => set({ ids: new Set(ids), hydrated: true }),
  add: (id) =>
    set((state) => {
      const next = new Set(state.ids);
      next.add(id);
      return { ids: next };
    }),
  remove: (id) =>
    set((state) => {
      const next = new Set(state.ids);
      next.delete(id);
      return { ids: next };
    }),
  clear: () => set({ ids: new Set<string>() }),
}));
