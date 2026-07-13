'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storefrontApi } from '@/lib/storefrontApi';
import { useAuthStore } from '@/stores/authStore';
import type { Order } from '@/types/catalog';

function formatLKR(v: number): string {
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  BANK_TRANSFER: 'Bank transfer',
  PAYHERE: 'Card (PayHere)',
};

export function OrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !token) return;
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

  if (error) {
    return (
      <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
        {error}
      </p>
    );
  }
  if (!order) {
    return <p className="text-[0.9rem] text-brand-ink-soft">Loading order…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-brand-cream px-3 py-1 text-[0.78rem] font-semibold text-brand-ink">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
        <span className="text-[0.82rem] text-brand-ink-soft">
          Placed {formatDate(order.createdAt)}
        </span>
        <span className="text-[0.82rem] text-brand-ink-soft">
          Payment: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} —{' '}
          {order.paymentStatus}
        </span>
      </div>

      <div className="rounded-[14px] border border-brand-line bg-white p-4">
        <h3 className="mb-3 font-semibold text-brand-ink">Items</h3>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-brand-cream/40">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {item.productSlug ? (
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="truncate text-[0.9rem] font-semibold text-brand-ink hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="truncate text-[0.9rem] font-semibold text-brand-ink">
                    {item.name}
                  </span>
                )}
                <div className="text-[0.78rem] text-brand-ink-soft">
                  {formatLKR(item.price)} × {item.quantity}
                </div>
              </div>
              <div className="text-[0.9rem] font-semibold">{formatLKR(item.lineTotal)}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[14px] border border-brand-line bg-white p-4">
          <h3 className="mb-2 font-semibold text-brand-ink">Ship to</h3>
          <div className="text-[0.88rem] text-brand-ink-soft">
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
        <div className="rounded-[14px] border border-brand-line bg-white p-4">
          <h3 className="mb-2 font-semibold text-brand-ink">Totals</h3>
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
              <dd>{order.shippingAmount === 0 ? 'Free' : formatLKR(order.shippingAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-line pt-2 font-bold">
              <dt>Total</dt>
              <dd>{formatLKR(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-[14px] border border-brand-line bg-white p-4">
          <h3 className="mb-1 font-semibold text-brand-ink">Order notes</h3>
          <p className="text-[0.88rem] text-brand-ink-soft">{order.notes}</p>
        </div>
      )}

      <div>
        <Link
          href="/account/orders"
          className="text-[0.85rem] font-semibold text-brand-indigo hover:underline"
        >
          ← Back to orders
        </Link>
      </div>
    </div>
  );
}
