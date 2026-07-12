'use client';

import Image from 'next/image';
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

function formatLKR(v: number): string {
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartPageClient() {
  const mounted = useHasHydrated();
  const items = useCartStore((s) => s.items);
  const count = useCartStore(selectItemCount);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <p className="text-brand-ink-soft">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <h1 className="mb-6 font-chewy text-[2rem] text-brand-indigo">Your cart</h1>
        <div className="rounded-[16px] border border-dashed border-brand-line bg-brand-cream/40 p-12 text-center">
          <div className="mb-3 text-4xl">🛒</div>
          <h2 className="mb-2 font-chewy text-[1.4rem] text-brand-indigo">Nothing here yet</h2>
          <p className="mb-6 text-[0.95rem] text-brand-ink-soft">
            Add craft kits from our shop to get started.
          </p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-brand-indigo px-6 py-3 text-[0.95rem] font-bold text-white hover:bg-brand-indigo/90"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="mb-2 font-chewy text-[2rem] text-brand-indigo">Your cart</h1>
      <p className="mb-6 text-[0.9rem] text-brand-ink-soft">
        {count} item{count === 1 ? '' : 's'}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={`${item.productId}:${item.variantId ?? ''}`}
              className="flex flex-wrap items-center gap-4 rounded-[14px] border border-brand-line bg-white p-3"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[12px] bg-brand-cream/40">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-ink-soft">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[160px]">
                <div className="font-semibold text-brand-ink">{item.name}</div>
                {item.variantLabel && (
                  <div className="text-[0.78rem] font-semibold text-brand-sky-deep">
                    {item.variantLabel}
                  </div>
                )}
                <div className="text-[0.85rem] text-brand-ink-soft">
                  {formatLKR(item.price)} each
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease"
                  onClick={() => updateQuantity(item.productId, item.variantId ?? null, item.quantity - 1)}
                  className="h-8 w-8 rounded-full border border-brand-line font-semibold text-brand-ink hover:bg-brand-cream"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase"
                  onClick={() => updateQuantity(item.productId, item.variantId ?? null, item.quantity + 1)}
                  className="h-8 w-8 rounded-full border border-brand-line font-semibold text-brand-ink hover:bg-brand-cream"
                >
                  +
                </button>
              </div>
              <div className="w-24 text-right font-semibold text-brand-ink">
                {formatLKR(item.price * item.quantity)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.productId, item.variantId ?? null)}
                className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-berry hover:bg-brand-cream"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-[16px] border border-brand-line bg-white p-5">
          <h2 className="mb-4 font-chewy text-[1.3rem] text-brand-indigo">Order summary</h2>
          <dl className="mb-4 space-y-2 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-brand-ink-soft">Subtotal</dt>
              <dd className="font-semibold text-brand-ink">{formatLKR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-ink-soft">Shipping</dt>
              <dd className="text-brand-ink-soft">Calculated at checkout</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="block w-full rounded-full bg-brand-indigo px-5 py-3 text-center text-[0.95rem] font-bold text-white hover:bg-brand-indigo/90"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-[0.85rem] font-semibold text-brand-ink-soft hover:text-brand-indigo"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
