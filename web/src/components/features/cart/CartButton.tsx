'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { selectItemCount, useCartStore } from '@/stores/cartStore';

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

export function CartButton() {
  const count = useCartStore(selectItemCount);
  const mounted = useHasHydrated();

  return (
    <button
      type="button"
      aria-label="Shopping cart"
      className="flex items-center gap-[7px] rounded-full bg-brand-gold px-[18px] py-[9px] text-[0.86rem] font-bold text-brand-indigo transition-colors hover:bg-brand-gold-deep"
    >
      <CartIcon />
      Cart
      {mounted && count > 0 && (
        <span className="rounded-full bg-brand-berry px-1.5 py-px text-[0.7rem] font-bold text-white">{count}</span>
      )}
    </button>
  );
}
