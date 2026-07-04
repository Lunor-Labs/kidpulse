'use client';

import { useSyncExternalStore } from 'react';
import { selectItemCount, useCartStore } from '@/stores/cartStore';

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function CartButton() {
  const count = useCartStore(selectItemCount);
  const mounted = useHasHydrated();

  return (
    <button
      type="button"
      aria-label="Shopping cart"
      className="relative flex items-center gap-2 rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-gold-deep"
    >
      <span aria-hidden>🛒</span>
      <span className="hidden sm:inline">Cart</span>
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-berry px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
