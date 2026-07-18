'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminActionLogPage } from '@/types/admin';

const PAGE_SIZE = 50;

function ts(iso: string) {
  return new Date(iso).toLocaleString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const methodClasses: Record<string, string> = {
  POST: 'bg-emerald-50 text-emerald-700',
  PUT: 'bg-amber-50 text-amber-700',
  PATCH: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-brand-berry/10 text-brand-berry',
};

export function ActionLogClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const [offset, setOffset] = useState(0);
  const [entity, setEntity] = useState('');
  const [page, setPage] = useState<AdminActionLogPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notSuperAdmin = hydrated && user?.role !== 'super_admin';

  useEffect(() => {
    if (!hydrated || notSuperAdmin) return;
    let ignore = false;
    setPage(null);
    setError(null);
    adminApi
      .listActionLog(
        { limit: PAGE_SIZE, offset, entity: entity.trim() || undefined },
        token
      )
      .then((data) => {
        if (!ignore) setPage(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [hydrated, notSuperAdmin, offset, entity, token]);

  if (notSuperAdmin) {
    return (
      <AccountCard title="Admin action log" subtitle="Super Admin only.">
        <p className="text-[0.9rem] text-brand-berry">
          Your role ({user?.role ?? 'unknown'}) does not have permission for this page.
        </p>
      </AccountCard>
    );
  }

  const rows = page?.data ?? [];
  const total = page?.total ?? 0;
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  return (
    <AccountCard
      title="Admin action log"
      subtitle="Every mutating admin request is recorded here."
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
          Entity filter
          <input
            type="text"
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setOffset(0);
            }}
            placeholder="e.g. products, orders, coupons"
            className="mt-1 w-[240px] rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] outline-none focus:border-brand-indigo"
          />
        </label>
      </div>

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!page && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading action log…</p>
      )}
      {page && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">No actions recorded.</p>
      )}
      {page && rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-[12px] border border-brand-line">
            <table className="w-full min-w-[720px] border-collapse text-[0.86rem]">
              <thead className="bg-brand-cream/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold text-brand-ink">When</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Actor</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Method</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Path</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Entity</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-brand-line align-top">
                    <td className="px-3 py-2 text-brand-ink-soft">{ts(row.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="text-brand-ink">{row.actorEmail ?? row.actorId}</div>
                      <div className="text-[0.72rem] text-brand-ink-soft">
                        {row.actorRole}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-[2px] text-[0.72rem] font-semibold ${
                          methodClasses[row.method] ?? 'bg-brand-cream text-brand-ink'
                        }`}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[0.78rem] text-brand-ink">
                      {row.path}
                    </td>
                    <td className="px-3 py-2 text-brand-ink-soft">
                      {row.entity ?? '—'}
                      {row.entityId && (
                        <div className="text-[0.7rem] opacity-70">{row.entityId}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-brand-ink-soft">{row.statusCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.82rem] text-brand-ink-soft">
            <div>
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!hasPrev}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                className="rounded-full border border-brand-line px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                className="rounded-full border border-brand-line px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </AccountCard>
  );
}
