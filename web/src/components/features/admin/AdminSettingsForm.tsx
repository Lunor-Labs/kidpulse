'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormField, inputClass } from './FormField';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminSettings, AdminSettingsFormValues } from '@/types/admin';

const EMPTY: AdminSettingsFormValues = {
  bankAccountName: '',
  bankName: '',
  bankBranch: '',
  bankAccountNumber: '',
  whatsappNumber: '',
  bankTransferDeadlineDays: 1,
  supportEmail: '',
};

function toValues(s: AdminSettings): AdminSettingsFormValues {
  return {
    bankAccountName: s.bankAccountName ?? '',
    bankName: s.bankName ?? '',
    bankBranch: s.bankBranch ?? '',
    bankAccountNumber: s.bankAccountNumber ?? '',
    whatsappNumber: s.whatsappNumber ?? '',
    bankTransferDeadlineDays: s.bankTransferDeadlineDays ?? 1,
    supportEmail: s.supportEmail ?? '',
  };
}

function nullish(v: string | null): string | null {
  return v && v.toString().trim() ? v.toString().trim() : null;
}

export function AdminSettingsForm() {
  const token = useAuthStore((s) => s.accessToken);
  const [values, setValues] = useState<AdminSettingsFormValues>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminApi
      .getSettings(token)
      .then((s) => setValues(toValues(s)))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoaded(true));
  }, [token]);

  function update<K extends keyof AdminSettingsFormValues>(
    key: K,
    val: AdminSettingsFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: AdminSettingsFormValues = {
        bankAccountName: nullish(values.bankAccountName),
        bankName: nullish(values.bankName),
        bankBranch: nullish(values.bankBranch),
        bankAccountNumber: nullish(values.bankAccountNumber),
        whatsappNumber: nullish(values.whatsappNumber),
        bankTransferDeadlineDays: values.bankTransferDeadlineDays,
        supportEmail: nullish(values.supportEmail),
      };
      const saved = await adminApi.updateSettings(payload, token);
      setValues(toValues(saved));
      toast.success('Settings saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <p className="text-[0.9rem] text-brand-ink-soft">Loading settings…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="mb-2 font-semibold text-brand-ink">Bank transfer</h3>
        <p className="mb-3 text-[0.82rem] text-brand-ink-soft">
          Shown to customers on the bank-transfer confirmation page and in the automated email.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Account name">
            <input
              className={inputClass}
              value={values.bankAccountName ?? ''}
              onChange={(e) => update('bankAccountName', e.target.value)}
            />
          </FormField>
          <FormField label="Bank name">
            <input
              className={inputClass}
              value={values.bankName ?? ''}
              onChange={(e) => update('bankName', e.target.value)}
            />
          </FormField>
          <FormField label="Branch">
            <input
              className={inputClass}
              value={values.bankBranch ?? ''}
              onChange={(e) => update('bankBranch', e.target.value)}
            />
          </FormField>
          <FormField label="Account number">
            <input
              className={inputClass}
              value={values.bankAccountNumber ?? ''}
              onChange={(e) => update('bankAccountNumber', e.target.value)}
            />
          </FormField>
          <FormField label="Transfer deadline (days)">
            <input
              type="number"
              min={1}
              max={30}
              className={inputClass}
              value={values.bankTransferDeadlineDays}
              onChange={(e) =>
                update('bankTransferDeadlineDays', Number.parseInt(e.target.value, 10) || 1)
              }
            />
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-brand-ink">Contact</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="WhatsApp number" hint="Including country code, e.g. +94771234567">
            <input
              className={inputClass}
              value={values.whatsappNumber ?? ''}
              onChange={(e) => update('whatsappNumber', e.target.value)}
            />
          </FormField>
          <FormField label="Support email">
            <input
              type="email"
              className={inputClass}
              value={values.supportEmail ?? ''}
              onChange={(e) => update('supportEmail', e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {error && (
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-3 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-brand-indigo px-6 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
