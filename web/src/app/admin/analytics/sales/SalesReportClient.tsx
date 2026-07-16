'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi, downloadCsv } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { SalesReport } from '@/types/admin';
import { DateRangePicker, SparkBar, defaultRange, money } from '../Shared';

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

export function SalesReportClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    setReport(null);
    setError(null);
    adminApi
      .getSalesReport({ from, to }, token)
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
        `/api/v1/admin/analytics/sales.csv?from=${from}&to=${to}`,
        `sales_${from}_${to}.csv`,
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
      title="Sales dashboard"
      subtitle="Revenue, orders and payment mix over the selected period."
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
            <Kpi label="Revenue" value={money(report.totals.revenue)} />
            <Kpi label="Orders" value={String(report.totals.orderCount)} />
            <Kpi
              label="Avg order value"
              value={money(report.totals.averageOrderValue)}
            />
            <Kpi
              label="Cancelled / failed"
              value={`${report.totals.cancelledCount} / ${report.totals.failedCount}`}
            />
          </div>

          <div className="rounded-[12px] border border-brand-line p-4">
            <div className="mb-3 text-[0.85rem] font-semibold text-brand-ink">
              Revenue by day
            </div>
            <SparkBar
              points={report.series.map((p) => ({
                label: p.date,
                value: p.revenue,
              }))}
              format={(v) => money(v)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[12px] border border-brand-line p-4">
              <div className="mb-3 text-[0.85rem] font-semibold text-brand-ink">
                Payment method breakdown
              </div>
              {report.paymentBreakdown.length === 0 ? (
                <p className="text-[0.85rem] text-brand-ink-soft">No revenue in range.</p>
              ) : (
                <table className="w-full text-[0.86rem]">
                  <thead className="text-left text-brand-ink-soft">
                    <tr>
                      <th className="py-1 font-semibold">Method</th>
                      <th className="py-1 font-semibold">Orders</th>
                      <th className="py-1 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.paymentBreakdown.map((p) => (
                      <tr key={p.paymentMethod} className="border-t border-brand-line">
                        <td className="py-1 text-brand-ink">{p.paymentMethod}</td>
                        <td className="py-1 text-brand-ink">{p.orderCount}</td>
                        <td className="py-1 font-semibold text-brand-ink">
                          {money(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-[12px] border border-brand-line p-4">
              <div className="mb-3 text-[0.85rem] font-semibold text-brand-ink">
                Orders by status
              </div>
              {report.statusBreakdown.length === 0 ? (
                <p className="text-[0.85rem] text-brand-ink-soft">No orders in range.</p>
              ) : (
                <table className="w-full text-[0.86rem]">
                  <thead className="text-left text-brand-ink-soft">
                    <tr>
                      <th className="py-1 font-semibold">Status</th>
                      <th className="py-1 font-semibold">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.statusBreakdown.map((s) => (
                      <tr key={s.status} className="border-t border-brand-line">
                        <td className="py-1 text-brand-ink">
                          {STATUS_LABEL[s.status] ?? s.status}
                        </td>
                        <td className="py-1 text-brand-ink">{s.orderCount}</td>
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
