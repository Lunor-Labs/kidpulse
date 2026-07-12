'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminProductBanner } from '@/types/admin';

export function ProductBannersListClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<AdminProductBanner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .listProductBanners(token)
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

  async function handleDelete(id: string, headline: string) {
    if (!confirm(`Delete banner "${headline}"?`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteProductBanner(id, token);
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Banner deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AccountCard
      title="Product page banners"
      subtitle="Side ads on the product detail page. Product-specific banners take priority over global fallbacks."
      actions={
        <Link
          href="/admin/product-banners/new"
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.88rem] font-semibold text-white hover:bg-brand-indigo/90"
        >
          + New banner
        </Link>
      }
    >
      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading banners…</p>
      )}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">
          No banners yet. Add one to promote offers on your product pages.
        </p>
      )}
      {rows && rows.length > 0 && (
        <ul className="grid grid-cols-1 gap-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-4 rounded-[14px] border border-brand-line bg-white p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold text-brand-ink">
                  {row.headline}
                </div>
                {row.subheadline && (
                  <div className="truncate text-[0.82rem] text-brand-ink-soft">
                    {row.subheadline}
                  </div>
                )}
                <div className="mt-1 flex flex-wrap gap-2 text-[0.72rem]">
                  <span
                    className={`rounded-full px-2 py-[1px] font-semibold ${
                      row.productId
                        ? 'bg-brand-berry/10 text-brand-berry'
                        : 'bg-brand-indigo/10 text-brand-indigo'
                    }`}
                  >
                    {row.productName ? `On: ${row.productName}` : 'Global'}
                  </span>
                  <span className="rounded-full bg-brand-cream px-2 py-[1px] text-brand-ink-soft">
                    Sort {row.sortOrder}
                  </span>
                  <span
                    className={`rounded-full px-2 py-[1px] font-semibold ${
                      row.isActive
                        ? 'bg-brand-olive/15 text-brand-olive'
                        : 'bg-brand-cream text-brand-ink-soft'
                    }`}
                  >
                    {row.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/product-banners/${row.id}`}
                  className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-ink hover:bg-brand-cream"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={deletingId === row.id}
                  onClick={() => handleDelete(row.id, row.headline)}
                  className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-berry hover:bg-brand-cream disabled:opacity-60"
                >
                  {deletingId === row.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountCard>
  );
}
