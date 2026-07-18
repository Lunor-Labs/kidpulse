'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCoupon } from '@/types/admin';

function money(v: number) {
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatValue(row: AdminCoupon) {
  return row.type === 'PERCENT' ? `${row.value}% off` : `${money(row.value)} off`;
}

function shortDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CouponsListClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<AdminCoupon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .listCoupons(token)
      .then((data) => {
        if (!ignore) setRows(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [token, hydrated]);

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon ${code}? Existing orders keep their record.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteCoupon(id, token);
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AccountCard
      title="Coupons"
      subtitle="Fixed or percentage discounts customers can enter at checkout."
      actions={
        <Link
          href="/admin/coupons/new"
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.88rem] font-semibold text-white hover:bg-brand-indigo/90"
        >
          + New coupon
        </Link>
      }
    >
      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && <p className="text-[0.9rem] text-brand-ink-soft">Loading coupons…</p>}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">
          No coupons yet. Create your first promotional code.
        </p>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full min-w-[820px] border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Code</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Discount</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Min. subtotal</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Usage</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Expires</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-brand-line align-top">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-brand-ink">{row.code}</div>
                    {row.description && (
                      <div className="text-[0.72rem] text-brand-ink-soft">
                        {row.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-brand-ink">{formatValue(row)}</td>
                  <td className="px-3 py-2 text-brand-ink-soft">
                    {row.minSubtotal ? money(row.minSubtotal) : '—'}
                  </td>
                  <td className="px-3 py-2 text-brand-ink-soft">
                    {row.totalRedemptions}
                    {row.maxRedemptions !== null && ` / ${row.maxRedemptions}`}
                    {row.perCustomerLimit && (
                      <div className="text-[0.72rem]">
                        Per customer: {row.perCustomerLimit}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-brand-ink-soft">
                    {shortDate(row.expiresAt) ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-[1px] text-[0.72rem] font-semibold ${
                        row.isActive
                          ? 'bg-brand-olive/15 text-brand-olive'
                          : 'bg-brand-cream text-brand-ink-soft'
                      }`}
                    >
                      {row.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/coupons/${row.id}`}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-ink hover:bg-brand-cream"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => handleDelete(row.id, row.code)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-berry hover:bg-brand-cream disabled:opacity-60"
                      >
                        {deletingId === row.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
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
