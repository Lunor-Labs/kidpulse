'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { storefrontApi } from '@/lib/storefrontApi';
import { useAuthStore } from '@/stores/authStore';
import type { Order } from '@/types/catalog';

const POLL_INTERVAL_MS = 15000; // poll every 15 seconds

const ACTIVE_STATUSES = new Set([
  'PENDING_PAYMENT',
  'PROCESSING',
  'SHIPPED',
]);

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
    hour: '2-digit',
    minute: '2-digit',
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

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-[#fff3da] text-[#b8860b]',
  PROCESSING:      'bg-brand-sky/10 text-brand-sky-deep',
  SHIPPED:         'bg-brand-indigo/10 text-brand-indigo',
  DELIVERED:       'bg-brand-olive/10 text-brand-olive',
  CANCELLED:       'bg-brand-berry/10 text-brand-berry',
  FAILED:          'bg-brand-berry/10 text-brand-berry',
};

const STATUS_STEPS = [
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

function StatusStepper({ status }: { status: string }) {
  if (status === 'CANCELLED' || status === 'FAILED' || status === 'PENDING_PAYMENT') {
    return null;
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="mb-6 flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const active  = i === currentIdx;
        const isLast  = i === STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.75rem] font-bold transition-colors ${
                  done
                    ? 'bg-brand-indigo text-white'
                    : 'border-2 border-brand-line bg-white text-brand-ink-soft'
                } ${active ? 'ring-2 ring-brand-indigo ring-offset-2' : ''}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`mt-1 text-[0.7rem] font-semibold ${
                  done ? 'text-brand-indigo' : 'text-brand-ink-soft'
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mb-4 h-[2px] flex-1 transition-colors ${
                  i < currentIdx ? 'bg-brand-indigo' : 'bg-brand-line'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const token    = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [order,        setOrder]        = useState<Order | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef  = useRef(true);

  const fetchOrder = async (showRefreshing = false) => {
    if (!token) return;
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await storefrontApi.getOrder(orderNumber, token);
      if (!mountedRef.current) return;
      setOrder(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      if (mountedRef.current) setIsRefreshing(false);
    }
  };

  // Schedule next poll — only if order is in an active status
  const schedulePoll = (currentOrder: Order | null) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!currentOrder) return;
    if (!ACTIVE_STATUSES.has(currentOrder.status)) return; // stop polling on terminal status
    timerRef.current = setTimeout(async () => {
      await fetchOrder(true);
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!hydrated || !token) return;
    fetchOrder();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hydrated, token, orderNumber]);

  // Re-schedule poll whenever order changes
  useEffect(() => {
    schedulePoll(order);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [order]);

  // Loading state
  if (!order && !error) {
    return (
      <p className="text-[0.9rem] text-brand-ink-soft">Loading order details…</p>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
        {error}
      </p>
    );
  }

  if (!order) return null;

  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const statusColor = STATUS_COLORS[order.status] ?? 'bg-brand-cream text-brand-ink';
  const isActive    = ACTIVE_STATUSES.has(order.status);

  return (
    <div>

      {/* ── Status banner ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-brand-line bg-white p-4">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[0.82rem] font-bold ${statusColor}`}>
            {statusLabel}
          </span>
          {isActive && (
            <span className="flex items-center gap-1 text-[0.75rem] text-brand-ink-soft">
              <span
                className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-olive"
              />
              Live tracking
            </span>
          )}
          {isRefreshing && (
            <span className="text-[0.72rem] text-brand-ink-soft">Refreshing…</span>
          )}
        </div>
        {lastUpdated && (
          <span className="text-[0.72rem] text-brand-ink-soft">
            Last updated {lastUpdated.toLocaleTimeString('en-LK')}
          </span>
        )}
      </div>

      {/* ── Progress stepper ── */}
      <StatusStepper status={order.status} />

      {/* ── Order meta ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Order number', value: order.orderNumber },
          { label: 'Date placed',  value: formatDate(order.createdAt) },
          { label: 'Payment',      value: order.paymentMethod.replace('_', ' ') },
          { label: 'Total',        value: formatLKR(order.total) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[12px] border border-brand-line bg-brand-cream/40 p-3"
          >
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.05em] text-brand-ink-soft">
              {label}
            </div>
            <div className="text-[0.88rem] font-semibold text-brand-ink">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Items ── */}
      <div className="mb-6 rounded-[14px] border border-brand-line bg-white">
        <div className="border-b border-brand-line px-4 py-3 text-[0.82rem] font-bold uppercase tracking-[0.05em] text-brand-ink-soft">
          Items
        </div>
        <ul className="divide-y divide-brand-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-brand-cream text-2xl">
                🎨
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.88rem] font-semibold text-brand-ink">
                  {item.productSlug ? (
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="hover:text-brand-indigo hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </div>
                <div className="text-[0.75rem] text-brand-ink-soft">
                  × {item.quantity}
                </div>
              </div>
              <div className="text-[0.88rem] font-semibold text-brand-ink">
                {formatLKR(item.lineTotal)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Price breakdown ── */}
      <div className="mb-6 rounded-[14px] border border-brand-line bg-white px-4 py-3">
        <dl className="space-y-2 text-[0.88rem]">
          <div className="flex justify-between">
            <dt className="text-brand-ink-soft">Subtotal</dt>
            <dd>{formatLKR(order.subtotal)}</dd>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-brand-olive">
              <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
              <dd>−{formatLKR(order.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-brand-ink-soft">Shipping</dt>
            <dd>{order.shippingAmount === 0 ? 'Free' : formatLKR(order.shippingAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-brand-line pt-2 text-[1rem] font-bold">
            <dt>Total</dt>
            <dd>{formatLKR(order.total)}</dd>
          </div>
        </dl>
      </div>

      {/* ── Delivery address ── */}
      <div className="mb-6 rounded-[14px] border border-brand-line bg-white px-4 py-3">
        <div className="mb-2 text-[0.82rem] font-bold uppercase tracking-[0.05em] text-brand-ink-soft">
          Delivery address
        </div>
        <address className="not-italic text-[0.88rem] leading-relaxed text-brand-ink">
          <div className="font-semibold">{order.ship.fullName}</div>
          <div>{order.ship.addressLine1}</div>
          {order.ship.addressLine2 && <div>{order.ship.addressLine2}</div>}
          <div>{order.ship.city}, {order.ship.district}
            {order.ship.postalCode ? ` ${order.ship.postalCode}` : ''}
          </div>
          <div>{order.ship.country}</div>
          <div className="mt-1 text-brand-ink-soft">{order.ship.phone}</div>
        </address>
      </div>

      {/* ── Notes ── */}
      {order.notes && (
        <div className="mb-6 rounded-[14px] border border-brand-line bg-white px-4 py-3">
          <div className="mb-1 text-[0.82rem] font-bold uppercase tracking-[0.05em] text-brand-ink-soft">
            Order notes
          </div>
          <p className="text-[0.88rem] text-brand-ink-soft">{order.notes}</p>
        </div>
      )}

      {/* ── Back link ── */}
      <Link
        href="/account/orders"
        className="text-[0.85rem] font-semibold text-brand-indigo hover:underline"
      >
        ← Back to orders
      </Link>

    </div>
  );
}