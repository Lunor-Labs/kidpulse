'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminDashboardStats } from '@/types/admin';

const STAT_CARDS: Array<{
  key: keyof AdminDashboardStats;
  label: string;
  accent: string;
}> = [
  { key: 'activeProducts', label: 'Active products', accent: 'text-brand-indigo' },
  { key: 'activeCategories', label: 'Active categories', accent: 'text-brand-sky-deep' },
  { key: 'lowStock', label: 'Low stock', accent: 'text-brand-gold-deep' },
  { key: 'outOfStock', label: 'Out of stock', accent: 'text-brand-berry' },
  { key: 'totalReviews', label: 'Reviews', accent: 'text-brand-olive' },
];

export function AdminDashboardClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .dashboard(token)
      .then((data) => {
        if (!ignore) setStats(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [token, hydrated]);

  return (
    <div className="space-y-6">
      <AccountCard
        title="Dashboard"
        subtitle="At-a-glance store health. Manage catalog from the sidebar."
      >
        {error && (
          <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
            {error}
          </p>
        )}
        {!stats && !error && (
          <p className="text-[0.9rem] text-brand-ink-soft">Loading store metrics…</p>
        )}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STAT_CARDS.map((card) => (
              <div
                key={card.key}
                className="rounded-[14px] border border-brand-line bg-brand-cream/30 p-4"
              >
                <div className="text-[0.72rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
                  {card.label}
                </div>
                <div className={`mt-2 text-2xl font-bold ${card.accent}`}>
                  {stats[card.key]}
                </div>
              </div>
            ))}
          </div>
        )}
      </AccountCard>

      <AccountCard title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-full bg-brand-indigo px-4 py-2 text-[0.88rem] font-semibold text-white hover:bg-brand-indigo/90"
          >
            + New product
          </Link>
          <Link
            href="/admin/categories/new"
            className="rounded-full border border-brand-line bg-white px-4 py-2 text-[0.88rem] font-semibold text-brand-ink hover:bg-brand-cream"
          >
            + New category
          </Link>
        </div>
      </AccountCard>
    </div>
  );
}
