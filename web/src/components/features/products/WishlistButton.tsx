'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';

interface WishlistButtonProps {
  productId: string;
  variant?: 'card' | 'pdp' | 'bar';
}

export function WishlistButton({ productId, variant = 'card' }: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const inWishlist = useWishlistStore((s) => s.ids.has(productId));
  const add = useWishlistStore((s) => s.add);
  const remove = useWishlistStore((s) => s.remove);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      startTransition(() =>
        router.push(`/login?next=${encodeURIComponent(pathname || '/')}`)
      );
      return;
    }
    setBusy(true);
    // Optimistic update
    const wasIn = inWishlist;
    if (wasIn) remove(productId);
    else add(productId);
    try {
      const result = await apiClient.post<{ productId: string; inWishlist: boolean }>(
        '/api/v1/account/wishlist/toggle',
        { productId },
        token
      );
      toast.success(result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (e) {
      // Roll back
      if (wasIn) add(productId);
      else remove(productId);
      toast.error(e instanceof Error ? e.message : 'Could not update wishlist');
    } finally {
      setBusy(false);
    }
  }

  const size = variant === 'pdp' ? 'h-11 w-11 text-[1.2rem]' : 'h-[30px] w-[30px] text-[0.95rem]';
  const filled = inWishlist ? '♥' : '♡';

  if (variant === 'bar') {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={busy || pending}
        aria-pressed={inWishlist}
        className={`w-full rounded-[14px] border-2 bg-white py-3 text-[0.95rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          inWishlist
            ? 'border-brand-berry text-brand-berry hover:border-brand-berry/70'
            : 'border-brand-line text-brand-indigo hover:border-brand-indigo'
        }`}
      >
        {filled} {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy || pending}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inWishlist}
      className={`absolute right-[10px] top-[10px] flex ${size} items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white ${
        inWishlist ? 'text-brand-berry' : 'text-brand-berry/70'
      }`}
    >
      {filled}
    </button>
  );
}
