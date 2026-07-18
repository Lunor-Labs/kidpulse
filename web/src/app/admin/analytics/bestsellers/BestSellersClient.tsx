'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi, downloadCsv } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCategory, BestSellersReport } from '@/types/admin';
import { DateRangePicker, defaultRange, money } from '../Shared';

export function BestSellersClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState<'units' | 'revenue'>('units');
  const [report, setReport] = useState<BestSellersReport | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    adminApi
      .listCategories(token)
      .then(setCategories)
      .catch(() => undefined);
  }, [hydrated, token]);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    setReport(null);
    setError(null);
    adminApi
      .getBestSellers(
        { from, to, categoryId: categoryId || undefined, sort, limit: 100 },
        token
      )
      .then((data) => {
        if (!ignore) setReport(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [from, to, categoryId, sort, hydrated, token]);

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ from, to, sort });
      if (categoryId) params.set('categoryId', categoryId);
      await downloadCsv(
        `/api/v1/admin/analytics/bestsellers.csv?${params.toString()}`,
        `bestsellers_${from}_${to}.csv`,
        token
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setExporting(false);
    }
  }

  return (
    <AccountCard
      title="Best sellers"
      subtitle="Top-selling products, filterable by category."
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
        extra={
          <>
            <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Category
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] text-brand-ink outline-none focus:border-brand-indigo"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'units' | 'revenue')}
                className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] text-brand-ink outline-none focus:border-brand-indigo"
              >
                <option value="units">Units sold</option>
                <option value="revenue">Revenue</option>
              </select>
            </label>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!report && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading report…</p>
      )}
      {report && report.rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">No sales in range.</p>
      )}
      {report && report.rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full min-w-[720px] border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">#</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Product</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Category</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Units</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Revenue</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Orders</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r, i) => (
                <tr key={r.productId} className="border-t border-brand-line">
                  <td className="px-3 py-2 text-brand-ink-soft">{i + 1}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/products/${r.slug}`}
                      className="font-semibold text-brand-indigo underline"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-brand-ink-soft">{r.categoryName}</td>
                  <td className="px-3 py-2 text-brand-ink">{r.unitsSold}</td>
                  <td className="px-3 py-2 font-semibold text-brand-ink">
                    {money(r.revenue)}
                  </td>
                  <td className="px-3 py-2 text-brand-ink-soft">{r.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountCard>
  );
}
