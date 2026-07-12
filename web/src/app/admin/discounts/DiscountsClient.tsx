'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { FormField, inputClass } from '@/components/features/admin/FormField';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type {
  AdminAutoDiscount,
  AdminCategory,
  AdminProduct,
  AdminQuantityDiscount,
  AdminSpendThreshold,
  AutoDiscountFormValues,
  QuantityDiscountFormValues,
  SpendThresholdFormValues,
} from '@/types/admin';

type Tab = 'auto' | 'quantity' | 'spend';

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'auto', label: 'Category auto-discounts' },
  { value: 'quantity', label: 'Quantity tiers' },
  { value: 'spend', label: 'Spend thresholds' },
];

function money(v: number) {
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function shortDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
function toDateInput(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromDateInput(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}

export function DiscountsClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [tab, setTab] = useState<Tab>('auto');
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    Promise.all([adminApi.listCategories(token), adminApi.listProducts(token)])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch(() => undefined);
  }, [token, hydrated]);

  return (
    <AccountCard
      title="Auto-discounts"
      subtitle="Automatic discounts applied at checkout without a code."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-full px-3 py-1 text-[0.78rem] font-semibold transition-colors ${
              tab === t.value
                ? 'bg-brand-indigo text-white'
                : 'border border-brand-line text-brand-ink hover:bg-brand-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'auto' && <AutoDiscountSection categories={categories} />}
      {tab === 'quantity' && <QuantityDiscountSection products={products} />}
      {tab === 'spend' && <SpendThresholdSection />}
    </AccountCard>
  );
}

function AutoDiscountSection({ categories }: { categories: AdminCategory[] }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<AdminAutoDiscount[] | null>(null);
  const [editing, setEditing] = useState<AdminAutoDiscount | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyValues = (): AutoDiscountFormValues => ({
    name: '',
    categoryId: categories[0]?.id ?? '',
    type: 'PERCENT',
    value: 10,
    startsAt: null,
    endsAt: null,
    isActive: true,
  });
  const [values, setValues] = useState<AutoDiscountFormValues>(emptyValues);

  useEffect(() => {
    if (!hydrated) return;
    adminApi.listAutoDiscounts(token).then(setRows).catch((e) => setError(e.message));
  }, [token, hydrated]);

  function startNew() {
    setEditing(null);
    setValues(emptyValues());
    setShowNew(true);
  }
  function startEdit(row: AdminAutoDiscount) {
    setEditing(row);
    setValues({
      name: row.name,
      categoryId: row.categoryId,
      type: row.type,
      value: row.value,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      isActive: row.isActive,
    });
    setShowNew(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminApi.updateAutoDiscount(editing.id, values, token);
        setRows((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? [updated]);
        toast.success('Discount updated');
      } else {
        const created = await adminApi.createAutoDiscount(values, token);
        setRows((prev) => [created, ...(prev ?? [])]);
        toast.success('Discount created');
      }
      setShowNew(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminApi.deleteAutoDiscount(id, token);
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Discount deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={startNew}
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white hover:bg-brand-indigo/90"
        >
          + New category discount
        </button>
      </div>

      {showNew && (
        <form
          onSubmit={submit}
          className="mb-4 space-y-3 rounded-[12px] border border-brand-line bg-brand-cream/30 p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Name" required>
              <input
                className={inputClass}
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Category" required>
              <select
                className={inputClass}
                value={values.categoryId}
                onChange={(e) => setValues({ ...values, categoryId: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormField label="Type" required>
              <select
                className={inputClass}
                value={values.type}
                onChange={(e) =>
                  setValues({ ...values, type: e.target.value as 'FIXED' | 'PERCENT' })
                }
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed (LKR)</option>
              </select>
            </FormField>
            <FormField label={values.type === 'PERCENT' ? 'Percent off' : 'Amount off (LKR)'} required>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={values.value}
                onChange={(e) => setValues({ ...values, value: Number(e.target.value) || 0 })}
                required
              />
            </FormField>
            <FormField label="Status">
              <label className="mt-2 inline-flex items-center gap-2 text-[0.9rem] text-brand-ink">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => setValues({ ...values, isActive: e.target.checked })}
                />
                Active
              </label>
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Starts at" hint="Blank = starts immediately">
              <input
                type="datetime-local"
                className={inputClass}
                value={toDateInput(values.startsAt)}
                onChange={(e) => setValues({ ...values, startsAt: fromDateInput(e.target.value) })}
              />
            </FormField>
            <FormField label="Ends at" hint="Blank = never ends">
              <input
                type="datetime-local"
                className={inputClass}
                value={toDateInput(values.endsAt)}
                onChange={(e) => setValues({ ...values, endsAt: fromDateInput(e.target.value) })}
              />
            </FormField>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-full border border-brand-line bg-white px-4 py-2 text-[0.85rem] font-semibold text-brand-ink hover:bg-brand-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">
          No category discounts yet. Add one to auto-apply savings on all items in a category.
        </p>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Name</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Category</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Discount</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Window</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-brand-line">
                  <td className="px-3 py-2 font-semibold text-brand-ink">{r.name}</td>
                  <td className="px-3 py-2 text-brand-ink-soft">{r.categoryName}</td>
                  <td className="px-3 py-2 text-brand-ink">
                    {r.type === 'PERCENT' ? `${r.value}%` : money(r.value)}
                  </td>
                  <td className="px-3 py-2 text-brand-ink-soft">
                    {shortDate(r.startsAt)} → {shortDate(r.endsAt)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-[1px] text-[0.72rem] font-semibold ${
                        r.isActive
                          ? 'bg-brand-olive/15 text-brand-olive'
                          : 'bg-brand-cream text-brand-ink-soft'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-ink hover:bg-brand-cream"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r.id, r.name)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-berry hover:bg-brand-cream"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuantityDiscountSection({ products }: { products: AdminProduct[] }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<AdminQuantityDiscount[] | null>(null);
  const [editing, setEditing] = useState<AdminQuantityDiscount | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyValues = (): QuantityDiscountFormValues => ({
    name: '',
    productId: null,
    minQuantity: 2,
    type: 'PERCENT',
    value: 10,
    isActive: true,
  });
  const [values, setValues] = useState<QuantityDiscountFormValues>(emptyValues);

  useEffect(() => {
    if (!hydrated) return;
    adminApi.listQuantityDiscounts(token).then(setRows).catch((e) => setError(e.message));
  }, [token, hydrated]);

  function startNew() {
    setEditing(null);
    setValues(emptyValues());
    setShowNew(true);
  }
  function startEdit(row: AdminQuantityDiscount) {
    setEditing(row);
    setValues({
      name: row.name,
      productId: row.productId,
      minQuantity: row.minQuantity,
      type: row.type,
      value: row.value,
      isActive: row.isActive,
    });
    setShowNew(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminApi.updateQuantityDiscount(editing.id, values, token);
        setRows((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? [updated]);
        toast.success('Discount updated');
      } else {
        const created = await adminApi.createQuantityDiscount(values, token);
        setRows((prev) => [created, ...(prev ?? [])]);
        toast.success('Discount created');
      }
      setShowNew(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminApi.deleteQuantityDiscount(id, token);
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Discount deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={startNew}
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white hover:bg-brand-indigo/90"
        >
          + New quantity tier
        </button>
      </div>

      {showNew && (
        <form
          onSubmit={submit}
          className="mb-4 space-y-3 rounded-[12px] border border-brand-line bg-brand-cream/30 p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Name" required>
              <input
                className={inputClass}
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Product" hint="Blank = store-wide">
              <select
                className={inputClass}
                value={values.productId ?? ''}
                onChange={(e) =>
                  setValues({ ...values, productId: e.target.value || null })
                }
              >
                <option value="">— Store-wide —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <FormField label="Min quantity" required>
              <input
                type="number"
                min={2}
                className={inputClass}
                value={values.minQuantity}
                onChange={(e) =>
                  setValues({ ...values, minQuantity: Number(e.target.value) || 2 })
                }
                required
              />
            </FormField>
            <FormField label="Type" required>
              <select
                className={inputClass}
                value={values.type}
                onChange={(e) =>
                  setValues({ ...values, type: e.target.value as 'FIXED' | 'PERCENT' })
                }
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed (LKR)</option>
              </select>
            </FormField>
            <FormField label={values.type === 'PERCENT' ? 'Percent off' : 'Amount off (LKR)'} required>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={values.value}
                onChange={(e) => setValues({ ...values, value: Number(e.target.value) || 0 })}
                required
              />
            </FormField>
            <FormField label="Status">
              <label className="mt-2 inline-flex items-center gap-2 text-[0.9rem] text-brand-ink">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => setValues({ ...values, isActive: e.target.checked })}
                />
                Active
              </label>
            </FormField>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-full border border-brand-line bg-white px-4 py-2 text-[0.85rem] font-semibold text-brand-ink hover:bg-brand-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">
          No quantity tiers yet. Reward bulk buyers with a per-unit discount.
        </p>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Name</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Scope</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Min qty</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Discount</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-brand-line">
                  <td className="px-3 py-2 font-semibold text-brand-ink">{r.name}</td>
                  <td className="px-3 py-2 text-brand-ink-soft">
                    {r.productName ?? 'Store-wide'}
                  </td>
                  <td className="px-3 py-2 text-brand-ink">{r.minQuantity}+</td>
                  <td className="px-3 py-2 text-brand-ink">
                    {r.type === 'PERCENT' ? `${r.value}% / unit` : `${money(r.value)} / unit`}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-[1px] text-[0.72rem] font-semibold ${
                        r.isActive
                          ? 'bg-brand-olive/15 text-brand-olive'
                          : 'bg-brand-cream text-brand-ink-soft'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-ink hover:bg-brand-cream"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r.id, r.name)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-berry hover:bg-brand-cream"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SpendThresholdSection() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<AdminSpendThreshold[] | null>(null);
  const [editing, setEditing] = useState<AdminSpendThreshold | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyValues = (): SpendThresholdFormValues => ({
    name: '',
    minSubtotal: 5000,
    type: 'PERCENT',
    value: 10,
    isActive: true,
  });
  const [values, setValues] = useState<SpendThresholdFormValues>(emptyValues);

  useEffect(() => {
    if (!hydrated) return;
    adminApi.listSpendDiscounts(token).then(setRows).catch((e) => setError(e.message));
  }, [token, hydrated]);

  function startNew() {
    setEditing(null);
    setValues(emptyValues());
    setShowNew(true);
  }
  function startEdit(row: AdminSpendThreshold) {
    setEditing(row);
    setValues({
      name: row.name,
      minSubtotal: row.minSubtotal,
      type: row.type,
      value: row.value,
      isActive: row.isActive,
    });
    setShowNew(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminApi.updateSpendDiscount(editing.id, values, token);
        setRows((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? [updated]);
        toast.success('Threshold updated');
      } else {
        const created = await adminApi.createSpendDiscount(values, token);
        setRows((prev) => [created, ...(prev ?? [])]);
        toast.success('Threshold created');
      }
      setShowNew(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminApi.deleteSpendDiscount(id, token);
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Threshold deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={startNew}
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white hover:bg-brand-indigo/90"
        >
          + New spend threshold
        </button>
      </div>

      {showNew && (
        <form
          onSubmit={submit}
          className="mb-4 space-y-3 rounded-[12px] border border-brand-line bg-brand-cream/30 p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Name" required>
              <input
                className={inputClass}
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Minimum subtotal (LKR)" required>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={values.minSubtotal}
                onChange={(e) =>
                  setValues({ ...values, minSubtotal: Number(e.target.value) || 0 })
                }
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormField label="Type" required>
              <select
                className={inputClass}
                value={values.type}
                onChange={(e) =>
                  setValues({ ...values, type: e.target.value as 'FIXED' | 'PERCENT' })
                }
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed (LKR)</option>
              </select>
            </FormField>
            <FormField label={values.type === 'PERCENT' ? 'Percent off' : 'Amount off (LKR)'} required>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={values.value}
                onChange={(e) => setValues({ ...values, value: Number(e.target.value) || 0 })}
                required
              />
            </FormField>
            <FormField label="Status">
              <label className="mt-2 inline-flex items-center gap-2 text-[0.9rem] text-brand-ink">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => setValues({ ...values, isActive: e.target.checked })}
                />
                Active
              </label>
            </FormField>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-full border border-brand-line bg-white px-4 py-2 text-[0.85rem] font-semibold text-brand-ink hover:bg-brand-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">
          No spend thresholds. Add one to reward larger orders — the highest applicable
          threshold wins.
        </p>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Name</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Min. subtotal</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Discount</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-brand-line">
                  <td className="px-3 py-2 font-semibold text-brand-ink">{r.name}</td>
                  <td className="px-3 py-2 text-brand-ink">{money(r.minSubtotal)}</td>
                  <td className="px-3 py-2 text-brand-ink">
                    {r.type === 'PERCENT' ? `${r.value}%` : money(r.value)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-[1px] text-[0.72rem] font-semibold ${
                        r.isActive
                          ? 'bg-brand-olive/15 text-brand-olive'
                          : 'bg-brand-cream text-brand-ink-soft'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-ink hover:bg-brand-cream"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r.id, r.name)}
                        className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-berry hover:bg-brand-cream"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
