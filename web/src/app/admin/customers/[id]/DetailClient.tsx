'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCustomerDetail } from '@/types/admin';

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

function money(v: number, currency = 'LKR') {
  return `${currency} ${v.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function longDate(iso: string) {
  return new Date(iso).toLocaleString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span aria-label={`${rating} out of 5`} className="text-brand-gold-deep">
      {'★'.repeat(filled)}
      <span className="text-brand-line">{'★'.repeat(5 - filled)}</span>
    </span>
  );
}

export function CustomerDetailClient({ id }: { id: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [row, setRow] = useState<AdminCustomerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [moderatingReviewId, setModeratingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .getCustomer(id, token)
      .then((data) => {
        if (!ignore) setRow(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id, token, hydrated]);

  async function handleModerateReview(reviewId: string, isApproved: boolean) {
    setModeratingReviewId(reviewId);
    try {
      await adminApi.moderateReview(reviewId, isApproved, token);
      setRow((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r) =>
                r.id === reviewId ? { ...r, isApproved } : r
              ),
            }
          : prev
      );
      toast.success(isApproved ? 'Review approved' : 'Review hidden');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setModeratingReviewId(null);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Delete this review permanently?')) return;
    setDeletingReviewId(reviewId);
    try {
      await adminApi.deleteReview(reviewId, token);
      setRow((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.filter((r) => r.id !== reviewId),
              reviewCount: Math.max(0, prev.reviewCount - 1),
            }
          : prev
      );
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingReviewId(null);
    }
  }

  if (error) {
    return (
      <AccountCard title="Customer profile">
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
        <Link
          href="/admin/customers"
          className="mt-4 inline-block text-[0.85rem] font-semibold text-brand-indigo underline"
        >
          ← Back to customers
        </Link>
      </AccountCard>
    );
  }

  if (!row) {
    return (
      <AccountCard title="Customer profile">
        <p className="text-[0.9rem] text-brand-ink-soft">Loading customer…</p>
      </AccountCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AccountCard
        title={row.fullName ?? row.email}
        subtitle={row.email}
        actions={
          <Link
            href="/admin/customers"
            className="rounded-full border border-brand-line px-3 py-1 text-[0.78rem] font-semibold text-brand-ink hover:bg-brand-cream"
          >
            ← All customers
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-3 text-[0.86rem] md:grid-cols-4">
          <div>
            <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Orders
            </div>
            <div className="mt-1 text-[1.1rem] font-bold text-brand-ink">{row.orderCount}</div>
          </div>
          <div>
            <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Lifetime spend
            </div>
            <div className="mt-1 text-[1.1rem] font-bold text-brand-ink">
              {money(row.totalSpent)}
            </div>
          </div>
          <div>
            <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Wishlist
            </div>
            <div className="mt-1 text-[1.1rem] font-bold text-brand-ink">
              {row.wishlistCount}
            </div>
          </div>
          <div>
            <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Reviews
            </div>
            <div className="mt-1 text-[1.1rem] font-bold text-brand-ink">{row.reviewCount}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-[0.86rem] md:grid-cols-3">
          <div>
            <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Phone
            </div>
            <div className="mt-1 text-brand-ink">{row.phone ?? '—'}</div>
          </div>
          <div>
            <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Joined
            </div>
            <div className="mt-1 text-brand-ink">{longDate(row.createdAt)}</div>
          </div>
          <div>
            <div className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
              Updated
            </div>
            <div className="mt-1 text-brand-ink">{longDate(row.updatedAt)}</div>
          </div>
        </div>
      </AccountCard>

      <AccountCard title="Addresses" subtitle="Saved shipping addresses.">
        {row.addresses.length === 0 && (
          <p className="text-[0.9rem] text-brand-ink-soft">No saved addresses.</p>
        )}
        {row.addresses.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {row.addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-[12px] border border-brand-line p-3 text-[0.86rem]"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-brand-ink">
                    {addr.label ?? 'Address'}
                  </div>
                  {addr.isDefault && (
                    <span className="rounded-full bg-brand-indigo/15 px-2 py-[1px] text-[0.7rem] font-semibold text-brand-indigo">
                      Default
                    </span>
                  )}
                </div>
                <div className="mt-1 text-brand-ink">{addr.fullName}</div>
                <div className="text-brand-ink-soft">{addr.phone}</div>
                <div className="mt-2 text-brand-ink-soft">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                </div>
                <div className="text-brand-ink-soft">
                  {addr.city}, {addr.district}
                  {addr.postalCode ? ` ${addr.postalCode}` : ''}
                </div>
                <div className="text-brand-ink-soft">{addr.country}</div>
              </div>
            ))}
          </div>
        )}
      </AccountCard>

      <AccountCard title="Recent orders" subtitle="Up to 20 most recent orders.">
        {row.recentOrders.length === 0 && (
          <p className="text-[0.9rem] text-brand-ink-soft">No orders yet.</p>
        )}
        {row.recentOrders.length > 0 && (
          <div className="overflow-x-auto rounded-[12px] border border-brand-line">
            <table className="w-full border-collapse text-[0.86rem]">
              <thead className="bg-brand-cream/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Order</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Payment</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Total</th>
                  <th className="px-3 py-2 font-semibold text-brand-ink">Date</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {row.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-brand-line">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-brand-ink">{o.orderNumber}</div>
                      <div className="text-[0.72rem] text-brand-ink-soft">
                        {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-brand-ink">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-brand-ink">{o.paymentMethod}</div>
                      <div className="text-[0.72rem] text-brand-ink-soft">{o.paymentStatus}</div>
                    </td>
                    <td className="px-3 py-2 font-semibold text-brand-ink">
                      {money(o.total, o.currency)}
                    </td>
                    <td className="px-3 py-2 text-brand-ink-soft">
                      {longDate(o.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/orders/${o.orderNumber}`}
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
        )}
      </AccountCard>

      <AccountCard
        title="Reviews"
        subtitle="Reviews left by this customer. Deleting removes it from the storefront."
      >
        {row.reviews.length === 0 && (
          <p className="text-[0.9rem] text-brand-ink-soft">No reviews submitted.</p>
        )}
        {row.reviews.length > 0 && (
          <ul className="flex flex-col gap-3">
            {row.reviews.map((rv) => (
              <li
                key={rv.id}
                className="rounded-[12px] border border-brand-line p-3 text-[0.88rem]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${rv.productSlug}`}
                      className="font-semibold text-brand-indigo underline"
                    >
                      {rv.productName}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <Stars rating={rv.rating} />
                      <span className="text-[0.72rem] text-brand-ink-soft">
                        {longDate(rv.createdAt)}
                      </span>
                      {!rv.isApproved && (
                        <span className="rounded-full bg-brand-berry/15 px-2 py-[1px] text-[0.7rem] font-semibold text-brand-berry">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={moderatingReviewId === rv.id}
                      onClick={() => handleModerateReview(rv.id, !rv.isApproved)}
                      className={`rounded-full border px-3 py-1 text-[0.74rem] font-semibold disabled:opacity-60 ${
                        rv.isApproved
                          ? 'border-brand-line text-brand-ink hover:bg-brand-cream'
                          : 'border-brand-olive/40 text-brand-olive hover:bg-brand-cream'
                      }`}
                    >
                      {moderatingReviewId === rv.id
                        ? 'Saving…'
                        : rv.isApproved
                        ? 'Hide'
                        : 'Approve'}
                    </button>
                    <button
                      type="button"
                      disabled={deletingReviewId === rv.id}
                      onClick={() => handleDeleteReview(rv.id)}
                      className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-berry hover:bg-brand-cream disabled:opacity-60"
                    >
                      {deletingReviewId === rv.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
                {rv.title && (
                  <div className="mt-2 font-semibold text-brand-ink">{rv.title}</div>
                )}
                <p className="mt-1 whitespace-pre-line text-brand-ink-soft">{rv.body}</p>
              </li>
            ))}
          </ul>
        )}
      </AccountCard>
    </div>
  );
}
