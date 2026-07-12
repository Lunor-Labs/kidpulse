'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormField, inputClass } from './FormField';
import { ImageUploader } from './ImageUploader';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type {
  AdminProduct,
  AdminProductBanner,
  ProductBannerFormValues,
} from '@/types/admin';

interface ProductBannerFormProps {
  initial?: AdminProductBanner;
}

function toValues(b?: AdminProductBanner): ProductBannerFormValues {
  return {
    productId: b?.productId ?? null,
    eyebrow: b?.eyebrow ?? '',
    headline: b?.headline ?? '',
    subheadline: b?.subheadline ?? '',
    imageUrl: b?.imageUrl ?? null,
    ctaLabel: b?.ctaLabel ?? '',
    ctaHref: b?.ctaHref ?? '',
    gradient: b?.gradient ?? '',
    sortOrder: b?.sortOrder ?? 0,
    isActive: b?.isActive ?? true,
  };
}

export function ProductBannerForm({ initial }: ProductBannerFormProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [values, setValues] = useState<ProductBannerFormValues>(toValues(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    adminApi.listProducts(token).then(setProducts).catch(() => setProducts([]));
  }, [token]);

  function update<K extends keyof ProductBannerFormValues>(
    key: K,
    val: ProductBannerFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.headline.trim()) {
      setError('Headline is required');
      return;
    }
    setSaving(true);
    try {
      const payload: ProductBannerFormValues = {
        ...values,
        productId: values.productId?.trim() || null,
        eyebrow: values.eyebrow?.toString().trim() || null,
        subheadline: values.subheadline?.toString().trim() || null,
        ctaLabel: values.ctaLabel?.toString().trim() || null,
        ctaHref: values.ctaHref?.toString().trim() || null,
        gradient: values.gradient?.toString().trim() || null,
        imageUrl: values.imageUrl?.toString().trim() || null,
      };
      if (initial) {
        await adminApi.updateProductBanner(initial.id, payload, token);
        toast.success('Banner updated');
      } else {
        await adminApi.createProductBanner(payload, token);
        toast.success('Banner created');
      }
      router.push('/admin/product-banners');
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

      <FormField
        label="Product"
        htmlFor="pb-product"
        hint="Leave empty for a global banner shown across all product pages"
      >
        <select
          id="pb-product"
          className={inputClass}
          value={values.productId ?? ''}
          onChange={(e) => update('productId', e.target.value || null)}
        >
          <option value="">— Global (all products) —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Eyebrow" htmlFor="pb-eyebrow" hint="Small pill above the headline">
        <input
          id="pb-eyebrow"
          className={inputClass}
          maxLength={80}
          value={values.eyebrow ?? ''}
          onChange={(e) => update('eyebrow', e.target.value)}
        />
      </FormField>

      <FormField label="Headline" htmlFor="pb-headline" required>
        <textarea
          id="pb-headline"
          className={inputClass}
          rows={2}
          maxLength={160}
          value={values.headline}
          onChange={(e) => update('headline', e.target.value)}
          required
        />
      </FormField>

      <FormField label="Subheadline" htmlFor="pb-sub">
        <textarea
          id="pb-sub"
          className={inputClass}
          rows={2}
          maxLength={280}
          value={values.subheadline ?? ''}
          onChange={(e) => update('subheadline', e.target.value)}
        />
      </FormField>

      <ImageUploader
        folder="product-banners"
        label="Banner image (optional)"
        value={values.imageUrl || null}
        onChange={(url) => update('imageUrl', url)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="CTA label" htmlFor="pb-cta">
          <input
            id="pb-cta"
            className={inputClass}
            maxLength={40}
            value={values.ctaLabel ?? ''}
            onChange={(e) => update('ctaLabel', e.target.value)}
          />
        </FormField>
        <FormField label="CTA link" htmlFor="pb-href" hint="URL or path (e.g. /products)">
          <input
            id="pb-href"
            className={inputClass}
            maxLength={400}
            value={values.ctaHref ?? ''}
            onChange={(e) => update('ctaHref', e.target.value)}
          />
        </FormField>
      </div>

      <FormField
        label="Background gradient (CSS)"
        htmlFor="pb-gradient"
        hint="Optional. e.g. linear-gradient(135deg, #1b0b80, #2c1aa0)"
      >
        <input
          id="pb-gradient"
          className={inputClass}
          maxLength={400}
          value={values.gradient ?? ''}
          onChange={(e) => update('gradient', e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Sort order" htmlFor="pb-sort" hint="Lower numbers show first">
          <input
            id="pb-sort"
            type="number"
            min={0}
            max={9999}
            className={inputClass}
            value={values.sortOrder}
            onChange={(e) => update('sortOrder', Number(e.target.value) || 0)}
          />
        </FormField>
        <FormField label="Status">
          <label className="mt-2 inline-flex items-center gap-2 text-[0.9rem] text-brand-ink">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
            />
            Active (shown on PDPs)
          </label>
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-brand-line pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-indigo px-5 py-2 text-[0.9rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create banner'}
        </button>
        <Link
          href="/admin/product-banners"
          className="rounded-full border border-brand-line bg-white px-5 py-2 text-[0.9rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
