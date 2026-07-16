'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormField, inputClass } from './FormField';
import { ProductImageManager } from './ProductImageManager';
import { ProductVariantManager } from './ProductVariantManager';
import { adminApi } from '@/lib/adminApi';
import { slugify } from '@/lib/slug';
import { useAuthStore } from '@/stores/authStore';
import type {
  AdminCategory,
  AdminProduct,
  ProductFormValues,
} from '@/types/admin';

interface ProductFormProps {
  initial?: AdminProduct;
}

function toValues(p?: AdminProduct): ProductFormValues {
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    description: p?.description ?? '',
    price: p?.price ?? 0,
    compareAtPrice: p?.compareAtPrice ?? null,
    sku: p?.sku ?? '',
    stockQuantity: p?.stockQuantity ?? 0,
    lowStockAlert: p?.lowStockAlert ?? 5,
    tags: p?.tags ?? [],
    ageRangeMin: p?.ageRangeMin ?? null,
    ageRangeMax: p?.ageRangeMax ?? null,
    isFeatured: p?.isFeatured ?? false,
    isBestSeller: p?.isBestSeller ?? false,
    isActive: p?.isActive ?? true,
    metaTitle: p?.metaTitle ?? '',
    metaDescription: p?.metaDescription ?? '',
    categoryId: p?.category.id ?? '',
    images:
      p?.images.map((img, i) => ({
        url: img.url,
        altText: img.altText,
        sortOrder: img.sortOrder ?? i,
      })) ?? [],
    variants:
      p?.variants.map((v, i) => ({
        id: v.id,
        label: v.label,
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stockQuantity: v.stockQuantity,
        imageUrl: v.imageUrl,
        sortOrder: v.sortOrder ?? i,
        isActive: v.isActive,
      })) ?? [],
  };
}

function numberOrNull(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function ProductForm({ initial }: ProductFormProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [values, setValues] = useState<ProductFormValues>(toValues(initial));
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    adminApi
      .listCategories(token)
      .then(setCategories)
      .catch((err: Error) => setError(err.message));
  }, [token, hydrated]);

  function update<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.categoryId) {
      setError('Please pick a category');
      return;
    }
    if (values.images.length === 0) {
      setError('Please add at least one product image');
      return;
    }
    setSaving(true);
    try {
      const payload: ProductFormValues = {
        ...values,
        description: values.description.trim(),
        metaTitle: values.metaTitle?.toString().trim() || null,
        metaDescription: values.metaDescription?.toString().trim() || null,
        tags: [
          ...new Set(
            tagsText
              .split(',')
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)
          ),
        ],
      };
      if (initial) {
        await adminApi.updateProduct(initial.id, payload, token);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(payload, token);
        toast.success('Product created');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Name" htmlFor="p-name" required>
          <input
            id="p-name"
            className={inputClass}
            value={values.name}
            onChange={(e) => {
              const v = e.target.value;
              update('name', v);
              if (!slugTouched) update('slug', slugify(v));
            }}
            required
          />
        </FormField>
        <FormField label="Slug" htmlFor="p-slug" hint="Lowercase kebab-case" required>
          <input
            id="p-slug"
            className={inputClass}
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update('slug', e.target.value);
            }}
            required
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="p-desc" required>
        <textarea
          id="p-desc"
          className={inputClass}
          rows={5}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label="Price (LKR)" htmlFor="p-price" required>
          <input
            id="p-price"
            type="number"
            step="0.01"
            min={0}
            className={inputClass}
            value={values.price}
            onChange={(e) => update('price', Number(e.target.value) || 0)}
            required
          />
        </FormField>
        <FormField label="Compare-at price (LKR)" htmlFor="p-cprice" hint="Optional. Shown as strikethrough.">
          <input
            id="p-cprice"
            type="number"
            step="0.01"
            min={0}
            className={inputClass}
            value={values.compareAtPrice ?? ''}
            onChange={(e) => update('compareAtPrice', numberOrNull(e.target.value))}
          />
        </FormField>
        <FormField label="SKU" htmlFor="p-sku" required>
          <input
            id="p-sku"
            className={inputClass}
            value={values.sku}
            onChange={(e) => update('sku', e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label="Stock quantity" htmlFor="p-stock" required>
          <input
            id="p-stock"
            type="number"
            min={0}
            className={inputClass}
            value={values.stockQuantity}
            onChange={(e) => update('stockQuantity', Number(e.target.value) || 0)}
            required
          />
        </FormField>
        <FormField label="Low-stock alert" htmlFor="p-low" hint="Trigger warning when stock ≤ this">
          <input
            id="p-low"
            type="number"
            min={0}
            className={inputClass}
            value={values.lowStockAlert}
            onChange={(e) => update('lowStockAlert', Number(e.target.value) || 0)}
          />
        </FormField>
        <FormField label="Category" htmlFor="p-cat" required>
          <select
            id="p-cat"
            className={inputClass}
            value={values.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            required
          >
            <option value="">— Select category —</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="Tags"
        htmlFor="p-tags"
        hint="Comma-separated. Used for search (e.g. montessori, wooden, stem)."
      >
        <input
          id="p-tags"
          className={inputClass}
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="montessori, wooden, stem"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Age range min" htmlFor="p-agemin" hint="Optional. Years.">
          <input
            id="p-agemin"
            type="number"
            min={0}
            max={18}
            className={inputClass}
            value={values.ageRangeMin ?? ''}
            onChange={(e) => update('ageRangeMin', numberOrNull(e.target.value))}
          />
        </FormField>
        <FormField label="Age range max" htmlFor="p-agemax" hint="Optional. Years.">
          <input
            id="p-agemax"
            type="number"
            min={0}
            max={18}
            className={inputClass}
            value={values.ageRangeMax ?? ''}
            onChange={(e) => update('ageRangeMax', numberOrNull(e.target.value))}
          />
        </FormField>
      </div>

      <fieldset className="rounded-[12px] border border-brand-line p-4">
        <legend className="px-2 text-[0.82rem] font-semibold text-brand-ink">Flags</legend>
        <div className="flex flex-wrap gap-4 text-[0.9rem] text-brand-ink">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => update('isFeatured', e.target.checked)}
            />
            Featured on homepage
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.isBestSeller}
              onChange={(e) => update('isBestSeller', e.target.checked)}
            />
            Best seller
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
            />
            Active (visible on storefront)
          </label>
        </div>
      </fieldset>

      <div>
        <div className="mb-2 text-[0.82rem] font-semibold text-brand-ink">Images</div>
        <ProductImageManager
          value={values.images}
          onChange={(imgs) => update('images', imgs)}
        />
      </div>

      <div>
        <div className="mb-2 text-[0.82rem] font-semibold text-brand-ink">Variants</div>
        <p className="mb-2 text-[0.76rem] text-brand-ink-soft">
          Each variant has its own price and stock. When variants exist, product stock is
          kept in sync automatically. Removing a variant hides it without breaking past
          orders.
        </p>
        <ProductVariantManager
          value={values.variants}
          onChange={(variants) => update('variants', variants)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="SEO title" htmlFor="p-meta-title" hint="Optional. Max 160 chars.">
          <input
            id="p-meta-title"
            className={inputClass}
            maxLength={160}
            value={values.metaTitle ?? ''}
            onChange={(e) => update('metaTitle', e.target.value)}
          />
        </FormField>
        <FormField label="SEO description" htmlFor="p-meta-desc" hint="Optional. Max 320 chars.">
          <input
            id="p-meta-desc"
            className={inputClass}
            maxLength={320}
            value={values.metaDescription ?? ''}
            onChange={(e) => update('metaDescription', e.target.value)}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-brand-line pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-indigo px-5 py-2 text-[0.9rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create product'}
        </button>
        <Link
          href="/admin/products"
          className="rounded-full border border-brand-line bg-white px-5 py-2 text-[0.9rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
