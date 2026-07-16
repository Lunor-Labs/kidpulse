'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storefrontApi } from '@/lib/storefrontApi';
import { useAuthStore } from '@/stores/authStore';
import type { Order } from '@/types/catalog';

function formatLKR(v: number): string {
  return `LKR ${v.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING:      'Processing',
  SHIPPED:         'Shipped',
  DELIVERED:       'Delivered',
  CANCELLED:       'Cancelled',
  FAILED:          'Failed',
};

export function OrdersListClient() {
  const token    = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !token) return;
    let ignore = false;
    storefrontApi
      .listOrders(token)
      .then((data) => { if (!ignore) setOrders(data); })
      .catch((err: Error) => { if (!ignore) setError(err.message); });
    return () => { ignore = true; };
  }, [token, hydrated]);

  if (error) {
    return (
      <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
        {error}
      </p>
    );
  }

  if (!orders) {
    return <p className="text-[0.9rem] text-brand-ink-soft">Loading orders…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-brand-line bg-brand-cream p-10 text-center">
        <div className="mb-3 text-4xl">📦</div>
        <h2 className="mb-1 font-chewy text-[1.2rem] text-brand-indigo">No orders yet</h2>
        <p className="mb-4 text-[0.9rem] text-brand-ink-soft">
          Your order history will appear here once you make a purchase.
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
    <ul className="space-y-3">
      {orders.map((order) => (
        <li
          key={order.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-brand-line bg-white p-4"
        >
          <div>
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className="font-semibold text-brand-indigo hover:underline"
            >
              {order.orderNumber}
            </Link>
            <div className="text-[0.82rem] text-brand-ink-soft">
              Placed {formatDate(order.createdAt)} · {order.items.length} item
              {order.items.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-cream px-3 py-1 text-[0.75rem] font-semibold text-brand-ink">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <span className="font-semibold text-brand-ink">{formatLKR(order.total)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}