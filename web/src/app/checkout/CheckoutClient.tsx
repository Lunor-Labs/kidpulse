'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { storefrontApi } from '@/lib/storefrontApi';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import type { Address } from '@/types/account';
import type {
  CheckoutInput,
  CheckoutResult,
  CouponValidation,
  PayHereStartFields,
  PaymentMethod,
} from '@/types/catalog';

function submitPayHereForm(fields: PayHereStartFields): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = fields.action;
  form.style.display = 'none';
  const entries: Array<[string, string]> = Object.entries(fields).filter(
    ([key]) => key !== 'action'
  ) as Array<[string, string]>;
  for (const [key, value] of entries) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

const SHIPPING_FLAT_LKR = 350;
const FREE_SHIPPING_THRESHOLD_LKR = 5000;

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  postalCode: string;
}

const EMPTY_SHIPPING: ShippingForm = {
  fullName: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  postalCode: '',
};

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function formatLKR(v: number): string {
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const inputClass =
  'w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none';

export function CheckoutClient() {
  const mounted = useHasHydrated();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = coupon?.discountAmount ?? 0;
  const shippingAmount =
    subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD_LKR ? 0 : SHIPPING_FLAT_LKR;
  const total = Math.max(0, subtotal - discountAmount) + shippingAmount;

  useEffect(() => {
    if (!hydrated || !token) return;
    apiClient
      .get<Address[]>('/api/v1/account/addresses', token)
      .then((data) => {
        setAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {
        /* ignore */
      });
  }, [token, hydrated]);

  useEffect(() => {
    if (user?.email && !shipping.email) {
      setShipping((prev) => ({
        ...prev,
        email: user.email,
        fullName: prev.fullName || user.fullName || '',
      }));
    }
  }, [user, shipping.email]);

  async function handleApplyCoupon() {
    setCouponError(null);
    const code = couponCode.trim();
    if (!code) {
      setCoupon(null);
      return;
    }
    try {
      const result = await storefrontApi.validateCoupon({ code, subtotal });
      setCoupon(result);
      toast.success(`Coupon applied: −${formatLKR(result.discountAmount)}`);
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon');
    }
  }

  function buildPayload(): CheckoutInput {
    const base: CheckoutInput = {
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? null,
        quantity: i.quantity,
      })),
      paymentMethod,
      couponCode: coupon?.code ?? null,
      notes: notes.trim() || null,
    };
    if (token && selectedAddressId) {
      return { ...base, addressId: selectedAddressId };
    }
    return {
      ...base,
      shippingAddress: {
        fullName: shipping.fullName.trim(),
        phone: shipping.phone.trim(),
        email: shipping.email.trim(),
        addressLine1: shipping.addressLine1.trim(),
        addressLine2: shipping.addressLine2.trim() || null,
        city: shipping.city.trim(),
        district: shipping.district.trim(),
        postalCode: shipping.postalCode.trim() || null,
        country: 'Sri Lanka',
      },
    };
  }

  function validateGuest(): string | null {
    if (token) return null;
    if (!shipping.email.trim()) return 'Email is required';
    if (!shipping.fullName.trim()) return 'Full name is required';
    if (!shipping.phone.trim()) return 'Phone is required';
    if (!shipping.addressLine1.trim()) return 'Address is required';
    if (!shipping.city.trim()) return 'City is required';
    if (!shipping.district.trim()) return 'District is required';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) return;
    if (token && !selectedAddressId && addresses.length > 0) {
      setError('Please choose a shipping address');
      return;
    }
    if (token && addresses.length === 0) {
      setError('Add a shipping address in your account first');
      return;
    }
    const guestErr = validateGuest();
    if (guestErr) {
      setError(guestErr);
      return;
    }
    setSubmitting(true);
    try {
      const result: CheckoutResult = await storefrontApi.placeOrder(buildPayload(), token);
      clearCart();
      const orderNumber = result.order.orderNumber;
      const method = result.order.paymentMethod;
      const params = new URLSearchParams();
      if (result.createdAccount) params.set('newAccount', '1');
      const qs = params.toString() ? `?${params}` : '';

      if (method === 'PAYHERE') {
        try {
          const fields = await storefrontApi.startPayHere(orderNumber, token);
          submitPayHereForm(fields);
          return;
        } catch {
          router.push(`/checkout/failed/${orderNumber}${qs}`);
          return;
        }
      }
      if (method === 'BANK_TRANSFER') {
        router.push(`/checkout/bank-transfer/${orderNumber}${qs}`);
        return;
      }
      router.push(`/checkout/success/${orderNumber}${qs}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place order');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <p className="text-brand-ink-soft">Loading checkout…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <h1 className="mb-4 font-chewy text-[2rem] text-brand-indigo">Checkout</h1>
        <div className="rounded-[16px] border border-dashed border-brand-line bg-brand-cream/40 p-10 text-center">
          <p className="mb-4 text-brand-ink-soft">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-brand-indigo px-5 py-2.5 font-bold text-white"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="mb-6 font-chewy text-[2rem] text-brand-indigo">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          {!token && (
            <section className="rounded-[16px] border border-brand-line bg-brand-cream/40 p-5">
              <h2 className="mb-2 font-chewy text-[1.2rem] text-brand-indigo">
                Guest checkout
              </h2>
              <p className="mb-3 text-[0.85rem] text-brand-ink-soft">
                No account? No problem. We&apos;ll create one for you with your email so you can
                track this order.
                {' '}
                <Link href="/login?next=/checkout" className="font-semibold text-brand-indigo">
                  Sign in instead
                </Link>
                .
              </p>
            </section>
          )}

          <section className="rounded-[16px] border border-brand-line bg-white p-5">
            <h2 className="mb-4 font-chewy text-[1.2rem] text-brand-indigo">
              Shipping address
            </h2>

            {token && addresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-[12px] border p-3 text-[0.9rem] ${
                      selectedAddressId === a.id
                        ? 'border-brand-indigo bg-brand-indigo/5'
                        : 'border-brand-line bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addr"
                      className="mt-1"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                    />
                    <div>
                      <div className="font-semibold text-brand-ink">
                        {a.fullName}
                        {a.label && (
                          <span className="ml-2 text-[0.72rem] font-normal text-brand-ink-soft">
                            ({a.label})
                          </span>
                        )}
                      </div>
                      <div className="text-brand-ink-soft">
                        {a.addressLine1}
                        {a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city},{' '}
                        {a.district}
                      </div>
                      <div className="text-brand-ink-soft">{a.phone}</div>
                    </div>
                  </label>
                ))}
                <Link
                  href="/account/addresses"
                  className="inline-block text-[0.82rem] font-semibold text-brand-indigo hover:underline"
                >
                  + Manage addresses
                </Link>
              </div>
            )}

            {(!token || addresses.length === 0) && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    Email
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    value={shipping.email}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    Full name
                  </label>
                  <input
                    className={inputClass}
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, fullName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    Phone
                  </label>
                  <input
                    className={inputClass}
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, phone: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    Address line 1
                  </label>
                  <input
                    className={inputClass}
                    value={shipping.addressLine1}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, addressLine1: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    Address line 2 (optional)
                  </label>
                  <input
                    className={inputClass}
                    value={shipping.addressLine2}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, addressLine2: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    City
                  </label>
                  <input
                    className={inputClass}
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    District
                  </label>
                  <input
                    className={inputClass}
                    value={shipping.district}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, district: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
                    Postal code
                  </label>
                  <input
                    className={inputClass}
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, postalCode: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[16px] border border-brand-line bg-white p-5">
            <h2 className="mb-4 font-chewy text-[1.2rem] text-brand-indigo">
              Payment method
            </h2>
            <div className="space-y-2">
              {(
                [
                  { key: 'COD', label: 'Cash on Delivery', hint: 'Pay when your order arrives' },
                  {
                    key: 'BANK_TRANSFER',
                    label: 'Bank transfer',
                    hint: "We'll email you the bank details after checkout",
                  },
                  {
                    key: 'PAYHERE',
                    label: 'Card / online payment (PayHere)',
                    hint: 'Secure card payment via PayHere',
                  },
                ] as Array<{ key: PaymentMethod; label: string; hint: string; disabled?: boolean }>
              ).map((opt) => (
                <label
                  key={opt.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-[12px] border p-3 ${
                    paymentMethod === opt.key
                      ? 'border-brand-indigo bg-brand-indigo/5'
                      : 'border-brand-line bg-white'
                  } ${opt.disabled ? 'opacity-50' : ''}`}
                >
                  <input
                    type="radio"
                    name="pm"
                    className="mt-1"
                    checked={paymentMethod === opt.key}
                    onChange={() => setPaymentMethod(opt.key)}
                    disabled={opt.disabled}
                  />
                  <div>
                    <div className="font-semibold text-brand-ink">{opt.label}</div>
                    <div className="text-[0.82rem] text-brand-ink-soft">{opt.hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[16px] border border-brand-line bg-white p-5">
            <h2 className="mb-3 font-chewy text-[1.2rem] text-brand-indigo">
              Order notes (optional)
            </h2>
            <textarea
              className={inputClass}
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else we should know?"
            />
          </section>
        </div>

        <aside className="h-fit rounded-[16px] border border-brand-line bg-white p-5">
          <h2 className="mb-4 font-chewy text-[1.3rem] text-brand-indigo">Your order</h2>
          <ul className="mb-4 space-y-2">
            {items.map((item) => (
              <li
                key={`${item.productId}:${item.variantId ?? ''}`}
                className="flex items-center gap-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[8px] bg-brand-cream/40">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.85rem] font-semibold text-brand-ink">
                    {item.name}
                  </div>
                  <div className="text-[0.75rem] text-brand-ink-soft">
                    {item.variantLabel ? `${item.variantLabel} · ` : ''}× {item.quantity}
                  </div>
                </div>
                <div className="text-[0.85rem] font-semibold">
                  {formatLKR(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <div className="mb-4">
            <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
              Coupon code
            </label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="rounded-full bg-brand-cream px-3 text-[0.82rem] font-semibold text-brand-ink hover:bg-brand-line"
              >
                Apply
              </button>
            </div>
            {coupon && (
              <p className="mt-1 text-[0.78rem] text-brand-olive">
                {coupon.code}: −{formatLKR(coupon.discountAmount)}
              </p>
            )}
            {couponError && (
              <p className="mt-1 text-[0.78rem] text-brand-berry">{couponError}</p>
            )}
          </div>

          <dl className="mb-4 space-y-2 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-brand-ink-soft">Subtotal</dt>
              <dd>{formatLKR(subtotal)}</dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-brand-olive">
                <dt>Discount</dt>
                <dd>−{formatLKR(discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-brand-ink-soft">Shipping</dt>
              <dd>{shippingAmount === 0 ? 'Free' : formatLKR(shippingAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-line pt-2 text-[1rem] font-bold">
              <dt>Total</dt>
              <dd>{formatLKR(total)}</dd>
            </div>
          </dl>

          {error && (
            <p className="mb-3 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-3 py-2 text-[0.82rem] text-brand-berry">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-brand-indigo px-5 py-3 text-[0.95rem] font-bold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
          >
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
          <p className="mt-3 text-center text-[0.75rem] text-brand-ink-soft">
            By placing your order you agree to our terms.
          </p>
        </aside>
      </form>
    </div>
  );
}
