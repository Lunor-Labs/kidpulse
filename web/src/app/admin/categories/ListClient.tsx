'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCategory } from '@/types/admin';

export function CategoriesListClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .listCategories(token)
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This will hide it from the storefront.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await adminApi.deleteCategory(id, token);
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AccountCard
      title="Categories"
      subtitle="Manage catalog categories, cover images, and SEO metadata."
      actions={
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.88rem] font-semibold text-white hover:bg-brand-indigo/90"
        >
          + New category
        </Link>
      }
    >
      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading categories…</p>
      )}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">
          No categories yet. Create your first one to start organising products.
        </p>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full min-w-[640px] border-collapse text-[0.88rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-4 py-2 font-semibold text-brand-ink">Name</th>
                <th className="px-4 py-2 font-semibold text-brand-ink">Slug</th>
                <th className="px-4 py-2 font-semibold text-brand-ink">Products</th>
                <th className="px-4 py-2 font-semibold text-brand-ink">Sort</th>
                <th className="px-4 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-brand-line">
                  <td className="px-4 py-2 font-semibold text-brand-ink">{row.name}</td>
                  <td className="px-4 py-2 text-brand-ink-soft">{row.slug}</td>
                  <td className="px-4 py-2">{row.productCount}</td>
                  <td className="px-4 py-2">{row.sortOrder}</td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/categories/${row.id}`}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-ink hover:bg-brand-cream"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => handleDelete(row.id, row.name)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-berry hover:bg-brand-cream disabled:opacity-60"
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
