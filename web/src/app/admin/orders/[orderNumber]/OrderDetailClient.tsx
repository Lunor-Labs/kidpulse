'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type {
  AdminOrderDetail,
  AdminOrderShippingUpdate,
} from '@/types/admin';

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

const STATUS_TONE: Record<string, string> = {
  PENDING_PAYMENT: 'bg-brand-gold-deep/15 text-brand-gold-deep',
  PROCESSING: 'bg-brand-indigo/15 text-brand-indigo',
  SHIPPED: 'bg-brand-olive/15 text-brand-olive',
  DELIVERED: 'bg-brand-olive/25 text-brand-olive',
  CANCELLED: 'bg-brand-berry/15 text-brand-berry',
  FAILED: 'bg-brand-berry/15 text-brand-berry',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function money(v: number, currency: string) {
  return `${currency} ${v.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function OrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const row = await adminApi.getOrder(orderNumber, token);
      setOrder(row);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load order');
    }
  }, [orderNumber, token]);

  useEffect(() => {
    if (!hydrated) return;
    refresh();
  }, [refresh, hydrated]);

  async function handleStatus(next: string) {
    if (!order) return;
    if (!confirm(`Move order ${order.orderNumber} to ${STATUS_LABEL[next] ?? next}?`)) return;
    setBusy(`status:${next}`);
    try {
      const row = await adminApi.updateOrderStatus(order.id, { status: next }, token);
      setOrder(row);
      toast.success(`Order is now ${STATUS_LABEL[next] ?? next}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleBankConfirm() {
    if (!order) return;
    if (!confirm('Mark this bank transfer as received?')) return;
    setBusy('bank-confirm');
    try {
      const row = await adminApi.confirmBankPayment(order.id, token);
      setOrder(row);
      toast.success('Payment confirmed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleBankCancel() {
    if (!order) return;
    const note = prompt('Reason (optional):');
    if (note === null) return;
    setBusy('bank-cancel');
    try {
      const row = await adminApi.cancelBankPayment(order.id, { note }, token);
      setOrder(row);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleShippingSave(update: AdminOrderShippingUpdate) {
    if (!order) return;
    setBusy('shipping');
    try {
      const row = await adminApi.updateOrderShipping(order.id, update, token);
      setOrder(row);
      toast.success('Shipping details updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(null);
    }
  }

  if (loadError) {
    return (
      <AccountCard title="Order" subtitle={loadError}>
        <Link href="/admin/orders" className="text-brand-indigo underline">
          ← Back to orders
        </Link>
      </AccountCard>
    );
  }

  if (!order) {
    return (
      <AccountCard title="Order" subtitle="Loading…">
        <p className="text-[0.9rem] text-brand-ink-soft">Fetching order details…</p>
      </AccountCard>
    );
  }

  async function handlePdf(kind: 'invoice' | 'packing-slip') {
    if (!order) return;
    setBusy(kind);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/orders/${order.orderNumber}/${kind}.pdf`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `PDF download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open PDF');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <AccountCard
        title={order.orderNumber}
        subtitle={`Placed ${fullDate(order.createdAt)} · ${STATUS_LABEL[order.status] ?? order.status}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="rounded-full border border-brand-line px-4 py-2 text-[0.84rem] font-semibold text-brand-ink hover:bg-brand-cream"
            >
              ← All orders
            </Link>
            <button
              type="button"
              onClick={() => handlePdf('invoice')}
              disabled={busy === 'invoice'}
              className="rounded-full bg-brand-indigo px-4 py-2 text-[0.84rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
            >
              {busy === 'invoice' ? 'Opening…' : 'Open invoice PDF'}
            </button>
            <button
              type="button"
              onClick={() => handlePdf('packing-slip')}
              disabled={busy === 'packing-slip'}
              className="rounded-full border border-brand-indigo px-4 py-2 text-[0.84rem] font-semibold text-brand-indigo hover:bg-brand-cream disabled:opacity-60"
            >
              {busy === 'packing-slip' ? 'Opening…' : 'Packing slip PDF'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[12px] border border-brand-line p-4">
            <div className="text-[0.72rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
              Status
            </div>
            <div className="mt-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-[0.8rem] font-semibold ${
                  STATUS_TONE[order.status] ?? 'bg-brand-cream text-brand-ink-soft'
                }`}
              >
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
            {order.allowedTransitions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {order.allowedTransitions.map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={busy === `status:${next}`}
                    onClick={() => handleStatus(next)}
                    className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-ink hover:bg-brand-cream disabled:opacity-50"
                  >
                    {busy === `status:${next}` ? 'Saving…' : `→ ${STATUS_LABEL[next] ?? next}`}
                  </button>
                ))}
              </div>
            )}
            {order.allowedTransitions.length === 0 && (
              <p className="mt-3 text-[0.76rem] text-brand-ink-soft">
                No further status changes are allowed.
              </p>
            )}
          </div>

          <div className="rounded-[12px] border border-brand-line p-4">
            <div className="text-[0.72rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
              Payment
            </div>
            <div className="mt-2 text-[0.9rem] text-brand-ink">
              <div>
                <span className="text-brand-ink-soft">Method: </span>
                {order.paymentMethod}
              </div>
              <div>
                <span className="text-brand-ink-soft">Status: </span>
                {order.paymentStatus}
              </div>
              {order.paymentAttempts > 0 && (
                <div>
                  <span className="text-brand-ink-soft">Attempts: </span>
                  {order.paymentAttempts}
                </div>
              )}
              {order.couponCode && (
                <div>
                  <span className="text-brand-ink-soft">Coupon: </span>
                  {order.couponCode}
                </div>
              )}
            </div>
            {order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus !== 'PAID' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === 'bank-confirm'}
                  onClick={handleBankConfirm}
                  className="rounded-full bg-brand-olive px-3 py-1 text-[0.76rem] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {busy === 'bank-confirm' ? 'Confirming…' : 'Confirm payment'}
                </button>
                <button
                  type="button"
                  disabled={busy === 'bank-cancel'}
                  onClick={handleBankCancel}
                  className="rounded-full border border-brand-berry px-3 py-1 text-[0.76rem] font-semibold text-brand-berry hover:bg-brand-berry/10 disabled:opacity-50"
                >
                  {busy === 'bank-cancel' ? 'Cancelling…' : 'Cancel order'}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-brand-line p-4">
            <div className="text-[0.72rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
              Total
            </div>
            <div className="mt-2 text-[1.3rem] font-bold text-brand-indigo">
              {money(order.total, order.currency)}
            </div>
            <div className="mt-1 space-y-1 text-[0.78rem] text-brand-ink-soft">
              <div>Subtotal: {money(order.subtotal, order.currency)}</div>
              {order.discountAmount > 0 && (
                <div>Discount: −{money(order.discountAmount, order.currency)}</div>
              )}
              <div>
                Shipping:{' '}
                {order.shippingAmount === 0
                  ? 'Free'
                  : money(order.shippingAmount, order.currency)}
              </div>
            </div>
          </div>
        </div>
      </AccountCard>

      <AccountCard title="Items">
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full border-collapse text-[0.88rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Item</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Qty</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Price</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-brand-line">
                  <td className="px-3 py-2">
                    {item.productSlug ? (
                      <Link
                        href={`/products/${item.productSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-ink hover:underline"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-brand-ink">{item.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{money(item.price, order.currency)}</td>
                  <td className="px-3 py-2 font-semibold">
                    {money(item.lineTotal, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccountCard>

      <ShippingSection
        order={order}
        onSave={handleShippingSave}
        busy={busy === 'shipping'}
      />

      <AccountCard title="Payment history">
        {order.payments.length === 0 ? (
          <p className="text-[0.9rem] text-brand-ink-soft">No payment attempts recorded.</p>
        ) : (
          <ul className="space-y-2">
            {order.payments.map((p) => (
              <li
                key={p.id}
                className="rounded-[10px] border border-brand-line p-3 text-[0.85rem]"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-brand-ink">{p.provider}</span>
                  <span className="text-brand-ink-soft">{money(p.amount, order.currency)}</span>
                  <span className="ml-auto text-[0.75rem] text-brand-ink-soft">
                    {fullDate(p.createdAt)}
                  </span>
                </div>
                <div className="mt-1 text-[0.78rem] text-brand-ink-soft">
                  Status: {p.status}
                  {p.providerRef ? ` · ref ${p.providerRef}` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AccountCard>

      <AccountCard title="Timeline">
        {order.statusEvents.length === 0 ? (
          <p className="text-[0.9rem] text-brand-ink-soft">No timeline events yet.</p>
        ) : (
          <ol className="space-y-3">
            {order.statusEvents.map((ev) => (
              <li key={ev.id} className="rounded-[10px] border border-brand-line p-3">
                <div className="flex flex-wrap items-baseline gap-2 text-[0.85rem]">
                  <span className="font-semibold text-brand-ink">
                    {ev.fromStatusLabel ? `${ev.fromStatusLabel} → ` : ''}
                    {ev.toStatusLabel}
                  </span>
                  <span className="text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
                    {ev.actorType}
                  </span>
                  <span className="ml-auto text-[0.75rem] text-brand-ink-soft">
                    {fullDate(ev.createdAt)}
                  </span>
                </div>
                {ev.note && (
                  <p className="mt-1 text-[0.82rem] text-brand-ink-soft">{ev.note}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </AccountCard>
    </div>
  );
}

function ShippingSection({
  order,
  onSave,
  busy,
}: {
  order: AdminOrderDetail;
  onSave: (update: AdminOrderShippingUpdate) => Promise<void>;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<AdminOrderShippingUpdate>({
    shipFullName: order.ship.fullName,
    shipPhone: order.ship.phone,
    shipAddressLine1: order.ship.addressLine1,
    shipAddressLine2: order.ship.addressLine2 ?? '',
    shipCity: order.ship.city,
    shipDistrict: order.ship.district,
    shipPostalCode: order.ship.postalCode ?? '',
    shipCountry: order.ship.country,
  });

  useEffect(() => {
    setValues({
      shipFullName: order.ship.fullName,
      shipPhone: order.ship.phone,
      shipAddressLine1: order.ship.addressLine1,
      shipAddressLine2: order.ship.addressLine2 ?? '',
      shipCity: order.ship.city,
      shipDistrict: order.ship.district,
      shipPostalCode: order.ship.postalCode ?? '',
      shipCountry: order.ship.country,
    });
  }, [order]);

  const editable = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  return (
    <AccountCard
      title="Shipping"
      subtitle={`${order.ship.email} · ${order.ship.phone}`}
      actions={
        editable && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-brand-line px-4 py-2 text-[0.84rem] font-semibold text-brand-ink hover:bg-brand-cream"
          >
            Edit
          </button>
        ) : null
      }
    >
      {!editing ? (
        <address className="not-italic text-[0.9rem] text-brand-ink">
          <div className="font-semibold">{order.ship.fullName}</div>
          <div>{order.ship.addressLine1}</div>
          {order.ship.addressLine2 && <div>{order.ship.addressLine2}</div>}
          <div>
            {order.ship.city}, {order.ship.district}
            {order.ship.postalCode ? ` ${order.ship.postalCode}` : ''}
          </div>
          <div>{order.ship.country}</div>
          <div className="mt-2 text-brand-ink-soft">{order.ship.phone}</div>
        </address>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const update: AdminOrderShippingUpdate = {
              ...values,
              shipAddressLine2: values.shipAddressLine2?.trim() ? values.shipAddressLine2 : null,
              shipPostalCode: values.shipPostalCode?.trim() ? values.shipPostalCode : null,
            };
            await onSave(update);
            setEditing(false);
          }}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <ShipField
            label="Full name"
            value={values.shipFullName ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipFullName: v }))}
          />
          <ShipField
            label="Phone"
            value={values.shipPhone ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipPhone: v }))}
          />
          <ShipField
            label="Address line 1"
            value={values.shipAddressLine1 ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipAddressLine1: v }))}
          />
          <ShipField
            label="Address line 2"
            value={values.shipAddressLine2 ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipAddressLine2: v }))}
          />
          <ShipField
            label="City"
            value={values.shipCity ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipCity: v }))}
          />
          <ShipField
            label="District"
            value={values.shipDistrict ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipDistrict: v }))}
          />
          <ShipField
            label="Postal code"
            value={values.shipPostalCode ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipPostalCode: v }))}
          />
          <ShipField
            label="Country"
            value={values.shipCountry ?? ''}
            onChange={(v) => setValues((p) => ({ ...p, shipCountry: v }))}
          />
          <div className="col-span-full flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-brand-indigo px-4 py-2 text-[0.86rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-brand-line px-4 py-2 text-[0.86rem] font-semibold text-brand-ink hover:bg-brand-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </AccountCard>
  );
}

function ShipField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">{label}</span>
      <input
        className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
