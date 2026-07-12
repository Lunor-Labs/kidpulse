'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminProduct } from '@/types/admin';

function formatPrice(rupees: number) {
  return `Rs. ${rupees.toLocaleString('en-LK')}`;
}

function stockLabel(p: AdminProduct) {
  if (p.stockQuantity === 0) return { text: 'Out of stock', tone: 'bg-brand-berry/15 text-brand-berry' };
  if (p.stockQuantity <= p.lowStockAlert)
    return { text: `Low (${p.stockQuantity})`, tone: 'bg-brand-gold-deep/15 text-brand-gold-deep' };
  return { text: `${p.stockQuantity}`, tone: 'bg-brand-olive/15 text-brand-olive' };
}

export function ProductsListClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .listProducts(token)
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

  const filtered = useMemo(() => {
    if (!rows) return null;
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.name.toLowerCase().includes(query)
    );
  }, [rows, q]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will hide it from the storefront.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteProduct(id, token);
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AccountCard
      title="Products"
      subtitle="Manage catalog products, images, stock, and SEO metadata."
      actions={
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.88rem] font-semibold text-white hover:bg-brand-indigo/90"
        >
          + New product
        </Link>
      }
    >
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search name, SKU or category…"
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
      {!filtered && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading products…</p>
      )}
      {filtered && filtered.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">No products match.</p>
      )}
      {filtered && filtered.length > 0 && (
        <div className="overflow-hidden rounded-[12px] border border-brand-line">
          <table className="w-full border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Product</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">SKU</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Category</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Price</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Stock</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const stock = stockLabel(row);
                const img = row.images[0];
                return (
                  <tr key={row.id} className="border-t border-brand-line">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[8px] bg-brand-cream/40">
                          {img ? (
                            <Image src={img.url} alt={row.name} fill sizes="40px" className="object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-brand-ink">{row.name}</div>
                          <div className="truncate text-[0.72rem] text-brand-ink-soft">{row.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-brand-ink-soft">{row.sku}</td>
                    <td className="px-3 py-2">{row.category.name}</td>
                    <td className="px-3 py-2">{formatPrice(row.price)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded-full px-2 py-[1px] text-[0.72rem] font-semibold ${stock.tone}`}>
                        {stock.text}
                      </span>
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
                          href={`/admin/products/${row.id}`}
                          className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-ink hover:bg-brand-cream"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === row.id}
                          onClick={() => handleDelete(row.id, row.name)}
                          className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-berry hover:bg-brand-cream disabled:opacity-60"
                        >
                          {deletingId === row.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AccountCard>
  );
}
