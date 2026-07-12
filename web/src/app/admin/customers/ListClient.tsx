'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCustomerListPage } from '@/types/admin';

const PAGE_SIZE = 25;

function money(v: number) {
  return `LKR ${v.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function shortDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CustomersListClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<AdminCustomerListPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    setPage(null);
    setError(null);
    adminApi
      .listCustomers(
        { q: debouncedQ || undefined, limit: PAGE_SIZE, offset },
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
  }, [debouncedQ, offset, token, hydrated]);

  const rows = page?.data ?? [];
  const total = page?.total ?? 0;
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE_SIZE, total);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  return (
    <AccountCard
      title="Customers"
      subtitle="Browse registered customers, their order history and reviews."
    >
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search email, name or phone…"
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
      {!page && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading customers…</p>
      )}
      {page && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">No customers match.</p>
      )}
      {page && rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-[12px] border border-brand-line">
            <table className="w-full border-collapse text-[0.86rem]">
              <thead className="bg-brand-cream/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Customer</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Contact</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Orders</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Spent</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Wishlist</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Reviews</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Last order</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-brand-line align-top">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-brand-ink">
                        {row.fullName ?? '(no name)'}
                      </div>
                      <div className="text-[0.72rem] text-brand-ink-soft">
                        Joined {shortDate(row.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-brand-ink">{row.email}</div>
                      {row.phone && (
                        <div className="text-[0.72rem] text-brand-ink-soft">{row.phone}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-brand-ink">{row.orderCount}</td>
                    <td className="px-3 py-2 font-semibold text-brand-ink">
                      {money(row.totalSpent)}
                    </td>
                    <td className="px-3 py-2 text-brand-ink-soft">{row.wishlistCount}</td>
                    <td className="px-3 py-2 text-brand-ink-soft">{row.reviewCount}</td>
                    <td className="px-3 py-2 text-brand-ink-soft">
                      {shortDate(row.lastOrderAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/customers/${row.id}`}
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.82rem] text-brand-ink-soft">
            <div>
              Showing {from}–{to} of {total}
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
