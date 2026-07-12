'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormField, inputClass } from './FormField';
import { ImageUploader } from './ImageUploader';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminHomeBanner, HomeBannerFormValues } from '@/types/admin';

interface HomeBannerFormProps {
  initial?: AdminHomeBanner;
}

function toValues(b?: AdminHomeBanner): HomeBannerFormValues {
  return {
    eyebrow: b?.eyebrow ?? '',
    headline: b?.headline ?? '',
    subheadline: b?.subheadline ?? '',
    imageUrl: b?.imageUrl ?? '',
    ctaLabel: b?.ctaLabel ?? '',
    ctaHref: b?.ctaHref ?? '',
    sortOrder: b?.sortOrder ?? 0,
    isActive: b?.isActive ?? true,
  };
}

export function HomeBannerForm({ initial }: HomeBannerFormProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [values, setValues] = useState<HomeBannerFormValues>(toValues(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof HomeBannerFormValues>(
    key: K,
    val: HomeBannerFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.imageUrl) {
      setError('Please upload a hero image first');
      return;
    }
    setSaving(true);
    try {
      const payload: HomeBannerFormValues = {
        ...values,
        eyebrow: values.eyebrow?.toString().trim() || null,
        subheadline: values.subheadline?.toString().trim() || null,
        ctaLabel: values.ctaLabel?.toString().trim() || null,
        ctaHref: values.ctaHref?.toString().trim() || null,
      };
      if (initial) {
        await adminApi.updateBanner(initial.id, payload, token);
        toast.success('Banner updated');
      } else {
        await adminApi.createBanner(payload, token);
        toast.success('Banner created');
      }
      router.push('/admin/banners');
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

      <FormField label="Eyebrow" htmlFor="b-eyebrow" hint="Small pill above the headline (optional)">
        <input
          id="b-eyebrow"
          className={inputClass}
          maxLength={80}
          value={values.eyebrow ?? ''}
          onChange={(e) => update('eyebrow', e.target.value)}
        />
      </FormField>

      <FormField label="Headline" htmlFor="b-headline" required>
        <textarea
          id="b-headline"
          className={inputClass}
          rows={2}
          maxLength={160}
          value={values.headline}
          onChange={(e) => update('headline', e.target.value)}
          required
        />
      </FormField>

      <FormField label="Subheadline" htmlFor="b-sub" hint="Optional supporting copy">
        <textarea
          id="b-sub"
          className={inputClass}
          rows={2}
          maxLength={280}
          value={values.subheadline ?? ''}
          onChange={(e) => update('subheadline', e.target.value)}
        />
      </FormField>

      <ImageUploader
        folder="banners"
        label="Hero image"
        value={values.imageUrl || null}
        onChange={(url) => update('imageUrl', url ?? '')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="CTA label" htmlFor="b-cta" hint="Optional button text">
          <input
            id="b-cta"
            className={inputClass}
            maxLength={40}
            value={values.ctaLabel ?? ''}
            onChange={(e) => update('ctaLabel', e.target.value)}
          />
        </FormField>
        <FormField label="CTA link" htmlFor="b-href" hint="Optional URL or path (e.g. /products)">
          <input
            id="b-href"
            className={inputClass}
            maxLength={400}
            value={values.ctaHref ?? ''}
            onChange={(e) => update('ctaHref', e.target.value)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Sort order" htmlFor="b-sort" hint="Lower numbers show first">
          <input
            id="b-sort"
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
            Active (shown on homepage)
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
          href="/admin/banners"
          className="rounded-full border border-brand-line bg-white px-5 py-2 text-[0.9rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
