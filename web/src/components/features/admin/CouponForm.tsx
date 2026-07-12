'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormField, inputClass } from './FormField';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCoupon, CouponFormValues } from '@/types/admin';

interface CouponFormProps {
  initial?: AdminCoupon;
}

function toValues(c?: AdminCoupon): CouponFormValues {
  return {
    code: c?.code ?? '',
    description: c?.description ?? '',
    type: c?.type ?? 'PERCENT',
    value: c?.value ?? 10,
    minSubtotal: c?.minSubtotal ?? null,
    maxRedemptions: c?.maxRedemptions ?? null,
    perCustomerLimit: c?.perCustomerLimit ?? null,
    expiresAt: c?.expiresAt ?? null,
    isActive: c?.isActive ?? true,
  };
}

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDateInput(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}

export function CouponForm({ initial }: CouponFormProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [values, setValues] = useState<CouponFormValues>(toValues(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CouponFormValues>(key: K, val: CouponFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: CouponFormValues = {
        ...values,
        code: values.code.trim().toUpperCase(),
        description: values.description?.toString().trim() || null,
      };
      if (initial) {
        await adminApi.updateCoupon(initial.id, payload, token);
        toast.success('Coupon updated');
      } else {
        await adminApi.createCoupon(payload, token);
        toast.success('Coupon created');
      }
      router.push('/admin/coupons');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Code" htmlFor="c-code" required hint="Case-insensitive, e.g. WELCOME10">
          <input
            id="c-code"
            className={inputClass}
            maxLength={40}
            value={values.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            required
          />
        </FormField>
        <FormField label="Status">
          <label className="mt-2 inline-flex items-center gap-2 text-[0.9rem] text-brand-ink">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
            />
            Active (redeemable at checkout)
          </label>
        </FormField>
      </div>

      <FormField label="Description" htmlFor="c-desc" hint="Shown to admins only">
        <input
          id="c-desc"
          className={inputClass}
          maxLength={280}
          value={values.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label="Type" htmlFor="c-type" required>
          <select
            id="c-type"
            className={inputClass}
            value={values.type}
            onChange={(e) => update('type', e.target.value as 'FIXED' | 'PERCENT')}
          >
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed (LKR)</option>
          </select>
        </FormField>
        <FormField
          label={values.type === 'PERCENT' ? 'Percent off' : 'Amount off (LKR)'}
          htmlFor="c-val"
          required
        >
          <input
            id="c-val"
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={values.value}
            onChange={(e) => update('value', Number(e.target.value) || 0)}
            required
          />
        </FormField>
        <FormField label="Min. subtotal (LKR)" htmlFor="c-min" hint="Blank = no minimum">
          <input
            id="c-min"
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={values.minSubtotal ?? ''}
            onChange={(e) =>
              update('minSubtotal', e.target.value ? Number(e.target.value) : null)
            }
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label="Total redemptions cap" htmlFor="c-max" hint="Blank = unlimited">
          <input
            id="c-max"
            type="number"
            min={1}
            className={inputClass}
            value={values.maxRedemptions ?? ''}
            onChange={(e) =>
              update('maxRedemptions', e.target.value ? Number(e.target.value) : null)
            }
          />
        </FormField>
        <FormField
          label="Per-customer limit"
          htmlFor="c-per"
          hint="How many times one customer can use it"
        >
          <input
            id="c-per"
            type="number"
            min={1}
            className={inputClass}
            value={values.perCustomerLimit ?? ''}
            onChange={(e) =>
              update('perCustomerLimit', e.target.value ? Number(e.target.value) : null)
            }
          />
        </FormField>
        <FormField label="Expires at" htmlFor="c-exp" hint="Blank = never expires">
          <input
            id="c-exp"
            type="datetime-local"
            className={inputClass}
            value={toDateInput(values.expiresAt)}
            onChange={(e) => update('expiresAt', fromDateInput(e.target.value))}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-brand-line pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-indigo px-5 py-2 text-[0.9rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create coupon'}
        </button>
        <Link
          href="/admin/coupons"
          className="rounded-full border border-brand-line bg-white px-5 py-2 text-[0.9rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
