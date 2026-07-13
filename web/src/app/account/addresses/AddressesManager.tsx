'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type { Address, AddressInput } from '@/types/account';

const EMPTY: AddressInput = {
  label: '',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  postalCode: '',
  country: 'Sri Lanka',
  isDefault: false,
};

export function AddressesManager() {
  const token = useAuthStore((s) => s.accessToken);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    apiClient
      .get<Address[]>('/api/v1/account/addresses', token)
      .then((data) => {
        if (!ignore) setAddresses(data);
      })
      .catch(() => toast.error('Could not load addresses'))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token]);

  function startNew() {
    setForm(EMPTY);
    setEditing('new');
  }

  function startEdit(a: Address) {
    setForm({
      label: a.label ?? '',
      fullName: a.fullName,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? '',
      city: a.city,
      district: a.district,
      postalCode: a.postalCode ?? '',
      country: a.country,
      isDefault: a.isDefault,
    });
    setEditing(a.id);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editing) return;
    setSaving(true);
    try {
      const payload: AddressInput = {
        ...form,
        label: form.label?.trim() || null,
        addressLine2: form.addressLine2?.trim() || null,
        postalCode: form.postalCode?.trim() || null,
      };
      if (editing === 'new') {
        const created = await apiClient.post<Address>(
          '/api/v1/account/addresses',
          payload,
          token
        );
        setAddresses((prev) => (payload.isDefault ? [created, ...prev.map((a) => ({ ...a, isDefault: false }))] : [...prev, created]));
        toast.success('Address added');
      } else {
        const updated = await apiClient.put<Address>(
          `/api/v1/account/addresses/${editing}`,
          payload,
          token
        );
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === updated.id
              ? updated
              : payload.isDefault
              ? { ...a, isDefault: false }
              : a
          )
        );
        toast.success('Address saved');
      }
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save address');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!token) return;
    if (!confirm('Delete this address?')) return;
    try {
      await apiClient.delete(`/api/v1/account/addresses/${id}`, token);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete');
    }
  }

  if (loading) return <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>;

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !editing && (
        <div className="rounded-[14px] border border-dashed border-brand-line bg-brand-cream p-8 text-center">
          <div className="mb-2 text-4xl">📮</div>
          <p className="text-[0.9rem] text-brand-ink-soft">
            No saved addresses yet. Add one to speed up checkout.
          </p>
        </div>
      )}

      {addresses.map((a) => (
        <div key={a.id} className="rounded-[14px] border border-brand-line bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-[0.95rem] text-brand-ink">{a.fullName}</strong>
                {a.label && (
                  <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[0.72rem] font-semibold text-brand-ink-soft">
                    {a.label}
                  </span>
                )}
                {a.isDefault && (
                  <span className="rounded-full bg-brand-olive px-2 py-0.5 text-[0.72rem] font-bold text-white">
                    Default
                  </span>
                )}
              </div>
              <div className="mt-1 text-[0.85rem] text-brand-ink-soft">
                {a.addressLine1}
                {a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city}, {a.district}
                {a.postalCode ? ` ${a.postalCode}` : ''}, {a.country}
              </div>
              <div className="text-[0.85rem] text-brand-ink-soft">{a.phone}</div>
            </div>
            <div className="flex gap-2 text-[0.82rem] font-semibold">
              <button
                type="button"
                onClick={() => startEdit(a)}
                className="text-brand-indigo hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="text-brand-berry hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {!editing ? (
        <button
          type="button"
          onClick={startNew}
          className="rounded-[12px] border border-dashed border-brand-indigo px-4 py-2.5 text-[0.9rem] font-bold text-brand-indigo hover:bg-brand-indigo/5"
        >
          + Add new address
        </button>
      ) : (
        <form onSubmit={save} className="rounded-[14px] border border-brand-line bg-brand-cream p-5 space-y-3">
          <h3 className="font-chewy text-[1.1rem] text-brand-indigo">
            {editing === 'new' ? 'New address' : 'Edit address'}
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Label (optional)" value={form.label ?? ''} onChange={(v) => setForm((f) => ({ ...f, label: v }))} placeholder="Home, Office…" />
            <Field label="Full name" value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} required />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} required type="tel" />
            <Field label="Address line 1" value={form.addressLine1} onChange={(v) => setForm((f) => ({ ...f, addressLine1: v }))} required />
            <Field label="Address line 2 (optional)" value={form.addressLine2 ?? ''} onChange={(v) => setForm((f) => ({ ...f, addressLine2: v }))} />
            <Field label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} required />
            <Field label="District" value={form.district} onChange={(v) => setForm((f) => ({ ...f, district: v }))} required />
            <Field label="Postal code" value={form.postalCode ?? ''} onChange={(v) => setForm((f) => ({ ...f, postalCode: v }))} />
            <Field label="Country" value={form.country ?? 'Sri Lanka'} onChange={(v) => setForm((f) => ({ ...f, country: v }))} />
          </div>
          <label className="flex items-center gap-2 text-[0.88rem] text-brand-ink">
            <input
              type="checkbox"
              checked={form.isDefault ?? false}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            Use this as my default address
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[12px] bg-brand-indigo px-5 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing === 'new' ? 'Add address' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-[12px] border border-brand-line px-5 py-2.5 text-[0.9rem] font-semibold text-brand-ink hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}

function Field({ label, value, onChange, required, type = 'text', placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
      />
    </label>
  );
}
