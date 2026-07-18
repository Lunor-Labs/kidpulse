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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

export function CartButton() {
  const count = useCartStore(selectItemCount);
  const mounted = useHasHydrated();
  const showBadge = mounted && count > 0;

  return (
    <Link
      href="/cart"
      aria-label={showBadge ? `Shopping cart (${count})` : 'Shopping cart'}
      className="relative inline-flex items-center gap-[7px] rounded-full text-[0.86rem] font-bold transition-colors
                 max-[980px]:p-0 max-[980px]:text-white max-[980px]:hover:text-brand-gold
                 min-[981px]:bg-brand-gold min-[981px]:px-[18px] min-[981px]:py-[9px] min-[981px]:text-brand-indigo min-[981px]:hover:bg-brand-gold-deep"
    >
      <span className="relative inline-flex">
        <CartIcon />
        {showBadge && (
          <span className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-brand-berry px-1 py-[1px] text-center text-[0.62rem] font-bold leading-4 text-white min-[981px]:hidden">
            {count}
          </span>
        )}
      </span>
      <span className="max-[980px]:hidden">Cart</span>
      {showBadge && (
        <span className="rounded-full bg-brand-berry px-1.5 py-px text-[0.7rem] font-bold text-white max-[980px]:hidden">
          {count}
        </span>
      )}
    </Link>
  );
}
