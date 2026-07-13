'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProductCard } from '@/components/features/home/ProductCard';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { WishlistItem } from '@/types/account';

export function WishlistGrid() {
  const token = useAuthStore((s) => s.accessToken);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    apiClient
      .get<WishlistItem[]>('/api/v1/account/wishlist', token)
      .then((data) => {
        if (!ignore) setItems(data);
      })
      .catch(() => toast.error('Could not load wishlist'))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token]);

  // Sync display with store state: if user removed via heart button elsewhere, drop from grid
  useEffect(() => {
    setItems((prev) => prev.filter((i) => wishlistIds.has(i.product.id)));
  }, [wishlistIds]);

  if (loading) return <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-brand-line bg-brand-cream p-10 text-center">
        <div className="mb-3 text-4xl">💛</div>
        <h2 className="mb-1 font-chewy text-[1.2rem] text-brand-indigo">Nothing saved yet</h2>
        <p className="mb-4 text-[0.9rem] text-brand-ink-soft">
          Tap the heart on any product to save it here.
        </p>
        <Link
          href="/products"
          className="inline-block rounded-[12px] bg-brand-indigo px-5 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <ProductCard key={i.id} product={i.product} />
      ))}
    </div>
  );
}
