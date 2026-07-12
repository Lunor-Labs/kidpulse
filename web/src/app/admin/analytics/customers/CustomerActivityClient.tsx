'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi, downloadCsv } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { CustomerActivityReport } from '@/types/admin';
import { DateRangePicker, SparkBar, defaultRange, money } from '../Shared';

export function CustomerActivityClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [report, setReport] = useState<CustomerActivityReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    setReport(null);
    setError(null);
    adminApi
      .getCustomerActivity({ from, to }, token)
      .then((data) => {
        if (!ignore) setReport(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [from, to, hydrated, token]);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadCsv(
        `/api/v1/admin/analytics/customers.csv?from=${from}&to=${to}`,
        `top_customers_${from}_${to}.csv`,
        token
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setExporting(false);
    }
  }

  const repeatPct = report ? (report.totals.repeatRate * 100).toFixed(1) : '—';

  return (
    <AccountCard
      title="Customer activity"
      subtitle="Signups, repeat rate, top customers and wishlist trends."
      actions={
        <Link
          href="/admin/analytics"
          className="rounded-full border border-brand-line px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          ← All reports
        </Link>
      }
    >
      <DateRangePicker
        from={from}
        to={to}
        onChange={(f, t) => {
          setFrom(f);
          setTo(t);
        }}
        onExport={handleExport}
        exporting={exporting}
        exportLabel="Download top customers"
      />

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!report && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading report…</p>
      )}
      {report && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="New customers" value={String(report.totals.newCustomers)} />
            <Kpi
              label="Ordering customers"
              value={String(report.totals.orderingCustomers)}
            />
            <Kpi label="Repeat customers" value={String(report.totals.repeatCustomers)} />
            <Kpi label="Repeat rate" value={`${repeatPct}%`} />
          </div>

          <div className="rounded-[12px] border border-brand-line p-4">
            <div className="mb-3 text-[0.85rem] font-semibold text-brand-ink">
              Signups by day
            </div>
            <SparkBar
              points={report.signups.map((p) => ({ label: p.date, value: p.count }))}
              format={String}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[12px] border border-brand-line p-4">
              <div className="mb-3 text-[0.85rem] font-semibold text-brand-ink">
                Top customers (lifetime in range)
              </div>
              {report.topCustomers.length === 0 ? (
                <p className="text-[0.85rem] text-brand-ink-soft">No orders in range.</p>
              ) : (
                <table className="w-full text-[0.86rem]">
                  <thead className="text-left text-brand-ink-soft">
                    <tr>
                      <th className="py-1 font-semibold">Customer</th>
                      <th className="py-1 font-semibold">Orders</th>
                      <th className="py-1 font-semibold">Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topCustomers.map((c) => (
                      <tr key={c.userId} className="border-t border-brand-line">
                        <td className="py-1">
                          <Link
                            href={`/admin/customers/${c.userId}`}
                            className="font-semibold text-brand-indigo underline"
                          >
                            {c.fullName ?? c.email}
                          </Link>
                          <div className="text-[0.72rem] text-brand-ink-soft">
                            {c.email}
                          </div>
                        </td>
                        <td className="py-1 text-brand-ink">{c.orderCount}</td>
                        <td className="py-1 font-semibold text-brand-ink">
                          {money(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-[12px] border border-brand-line p-4">
              <div className="mb-3 text-[0.85rem] font-semibold text-brand-ink">
                Wishlist trends (all time)
              </div>
              {report.wishlistTop.length === 0 ? (
                <p className="text-[0.85rem] text-brand-ink-soft">No wishlist activity yet.</p>
              ) : (
                <table className="w-full text-[0.86rem]">
                  <thead className="text-left text-brand-ink-soft">
                    <tr>
                      <th className="py-1 font-semibold">Product</th>
                      <th className="py-1 font-semibold">Wishlists</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.wishlistTop.map((w) => (
                      <tr key={w.productId} className="border-t border-brand-line">
                        <td className="py-1">
                          <Link
                            href={`/products/${w.slug}`}
                            className="font-semibold text-brand-indigo underline"
                          >
                            {w.name}
                          </Link>
                        </td>
                        <td className="py-1 text-brand-ink">{w.wishlistCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </AccountCard>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-brand-line bg-brand-cream/40 p-3">
      <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
        {label}
      </div>
      <div className="mt-1 text-[1.15rem] font-bold text-brand-ink">{value}</div>
    </div>
  );
}
