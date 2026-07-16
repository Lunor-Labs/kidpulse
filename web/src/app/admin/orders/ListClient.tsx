'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminOrderListItem } from '@/types/admin';

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
];

const STATUS_TONE: Record<string, string> = {
  PENDING_PAYMENT: 'bg-brand-gold-deep/15 text-brand-gold-deep',
  PROCESSING: 'bg-brand-indigo/15 text-brand-indigo',
  SHIPPED: 'bg-brand-olive/15 text-brand-olive',
  DELIVERED: 'bg-brand-olive/25 text-brand-olive',
  CANCELLED: 'bg-brand-berry/15 text-brand-berry',
  FAILED: 'bg-brand-berry/15 text-brand-berry',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

function money(v: number, currency: string) {
  return `${currency} ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function OrdersListClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [status, setStatus] = useState<string>('ALL');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [rows, setRows] = useState<AdminOrderListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    setRows(null);
    setError(null);
    adminApi
      .listOrders({ status, q: debouncedQ || undefined, limit: 200 }, token)
      .then((data) => {
        if (!ignore) setRows(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [status, debouncedQ, token, hydrated]);

  return (
    <AccountCard
      title="Orders"
      subtitle="View orders, change status, edit shipping, and confirm bank transfer payments."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-3 py-1 text-[0.78rem] font-semibold transition-colors ${
              status === tab.value
                ? 'bg-brand-indigo text-white'
                : 'border border-brand-line text-brand-ink hover:bg-brand-cream'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search order #, name, email or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 md:max-w-md"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && <p className="text-[0.9rem] text-brand-ink-soft">Loading orders…</p>}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">No orders match.</p>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Order</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Customer</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Payment</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Total</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Date</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-brand-line">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-brand-ink">{row.orderNumber}</div>
                    <div className="text-[0.72rem] text-brand-ink-soft">
                      {row.itemCount} {row.itemCount === 1 ? 'item' : 'items'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-brand-ink">{row.customerName}</div>
                    <div className="text-[0.72rem] text-brand-ink-soft">{row.customerEmail}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-brand-ink">{row.paymentMethod}</div>
                    <div className="text-[0.72rem] text-brand-ink-soft">{row.paymentStatus}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-[1px] text-[0.72rem] font-semibold ${
                        STATUS_TONE[row.status] ?? 'bg-brand-cream text-brand-ink-soft'
                      }`}
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-brand-ink">
                    {money(row.total, row.currency)}
                  </td>
                  <td className="px-3 py-2 text-brand-ink-soft">{shortDate(row.createdAt)}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/orders/${row.orderNumber}`}
                      className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-ink hover:bg-brand-cream"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountCard>
  );
}
