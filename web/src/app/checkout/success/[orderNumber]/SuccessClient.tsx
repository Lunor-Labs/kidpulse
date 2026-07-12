'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storefrontApi } from '@/lib/storefrontApi';
import { useAuthStore } from '@/stores/authStore';
import type { Order } from '@/types/catalog';

interface Props {
  orderNumber: string;
  createdAccount: boolean;
}

function formatLKR(v: number): string {
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SuccessClient({ orderNumber, createdAccount }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setError(null);
      return;
    }
    let ignore = false;
    storefrontApi
      .getOrder(orderNumber, token)
      .then((data) => {
        if (!ignore) setOrder(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [orderNumber, token, hydrated]);

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="rounded-[20px] border border-brand-line bg-white p-8 text-center">
        <div className="mb-3 text-5xl">🎉</div>
        <h1 className="mb-2 font-chewy text-[2rem] text-brand-indigo">
          Order confirmed!
        </h1>
        <p className="mb-6 text-brand-ink-soft">
          Thanks for shopping with KidPulse. Your order reference is{' '}
          <span className="font-semibold text-brand-ink">{orderNumber}</span>.
        </p>

        {createdAccount && (
          <div className="mb-6 rounded-[12px] border border-brand-gold/40 bg-brand-gold/10 p-4 text-left text-[0.9rem] text-brand-ink">
            <div className="mb-1 font-semibold">We created an account for you</div>
            <p className="text-brand-ink-soft">
              Check your inbox for a sign-in link so you can track this order and re-order
              easily next time.
            </p>
          </div>
        )}

        {order && (
          <div className="mb-6 rounded-[14px] border border-brand-line bg-brand-cream/40 p-5 text-left">
            <h2 className="mb-3 font-chewy text-[1.15rem] text-brand-indigo">Summary</h2>
            <ul className="mb-3 space-y-1 text-[0.9rem]">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatLKR(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 text-[0.9rem]">
              <div className="flex justify-between">
                <dt className="text-brand-ink-soft">Subtotal</dt>
                <dd>{formatLKR(order.subtotal)}</dd>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-brand-olive">
                  <dt>Discount ({order.couponCode})</dt>
                  <dd>−{formatLKR(order.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-brand-ink-soft">Shipping</dt>
                <dd>
                  {order.shippingAmount === 0 ? 'Free' : formatLKR(order.shippingAmount)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-brand-line pt-2 font-bold">
                <dt>Total</dt>
                <dd>{formatLKR(order.total)}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-[10px] bg-white p-3 text-[0.82rem]">
              <div className="mb-1 font-semibold text-brand-ink">Shipping to</div>
              <div className="text-brand-ink-soft">
                {order.ship.fullName}
                <br />
                {order.ship.addressLine1}
                {order.ship.addressLine2 ? `, ${order.ship.addressLine2}` : ''}
                <br />
                {order.ship.city}, {order.ship.district}
                {order.ship.postalCode ? ` ${order.ship.postalCode}` : ''}
                <br />
                {order.ship.phone}
              </div>
            </div>
          </div>
        )}

        {error && !order && (
          <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {token && (
            <Link
              href="/account/orders"
              className="rounded-full bg-brand-indigo px-5 py-2.5 font-bold text-white hover:bg-brand-indigo/90"
            >
              View my orders
            </Link>
          )}
          <Link
            href="/products"
            className="rounded-full border border-brand-line px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-cream"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
