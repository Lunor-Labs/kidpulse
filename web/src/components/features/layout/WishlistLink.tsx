'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { useWishlistStore } from '@/stores/wishlistStore';

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function WishlistIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

export function WishlistLink() {
  const count = useWishlistStore((s) => s.ids.size);
  const mounted = useHasHydrated();
  const showBadge = mounted && count > 0;

  return (
    <Link
      href="/account/wishlist"
      aria-label={showBadge ? `Wishlist (${count})` : 'Wishlist'}
      className="relative inline-flex items-center gap-1.5 transition-colors hover:text-brand-gold"
    >
      <span className="relative inline-flex">
        <WishlistIcon />
        {showBadge && (
          <span className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-brand-berry px-1 py-[1px] text-center text-[0.62rem] font-bold leading-4 text-white min-[981px]:hidden">
            {count}
          </span>
        )}
      </span>
      <span className="text-[0.9rem] font-semibold max-[980px]:hidden">Wishlist</span>
    </Link>
  );
}
