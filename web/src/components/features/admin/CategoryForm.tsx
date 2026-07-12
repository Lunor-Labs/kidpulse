'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { FormField, inputClass } from './FormField';
import { ImageUploader } from './ImageUploader';
import { adminApi } from '@/lib/adminApi';
import { slugify } from '@/lib/slug';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCategory, CategoryFormValues } from '@/types/admin';

interface CategoryFormProps {
  initial?: AdminCategory;
}

function toValues(cat?: AdminCategory): CategoryFormValues {
  return {
    name: cat?.name ?? '',
    slug: cat?.slug ?? '',
    description: cat?.description ?? '',
    imageUrl: cat?.imageUrl ?? null,
    sortOrder: cat?.sortOrder ?? 0,
    isActive: cat?.isActive ?? true,
    metaTitle: cat?.metaTitle ?? '',
    metaDescription: cat?.metaDescription ?? '',
  };
}

export function CategoryForm({ initial }: CategoryFormProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [values, setValues] = useState<CategoryFormValues>(toValues(initial));
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CategoryFormValues>(key: K, val: CategoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: CategoryFormValues = {
        ...values,
        description: values.description?.toString().trim() || null,
        metaTitle: values.metaTitle?.toString().trim() || null,
        metaDescription: values.metaDescription?.toString().trim() || null,
      };
      if (initial) {
        await adminApi.updateCategory(initial.id, payload, token);
        toast.success('Category updated');
      } else {
        await adminApi.createCategory(payload, token);
        toast.success('Category created');
      }
      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
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
        <FormField label="Name" htmlFor="cat-name" required>
          <input
            id="cat-name"
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

        <FormField label="Slug" htmlFor="cat-slug" hint="Lowercase kebab-case" required>
          <input
            id="cat-slug"
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

      <FormField label="Description" htmlFor="cat-desc">
        <textarea
          id="cat-desc"
          className={inputClass}
          rows={3}
          value={values.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </FormField>

      <ImageUploader
        folder="categories"
        label="Cover image"
        value={values.imageUrl}
        onChange={(url) => update('imageUrl', url)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Sort order" htmlFor="cat-sort" hint="Lower numbers show first">
          <input
            id="cat-sort"
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
            Active (visible on storefront)
          </label>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="SEO title" htmlFor="cat-meta-title" hint="Optional. Max 160 chars.">
          <input
            id="cat-meta-title"
            className={inputClass}
            maxLength={160}
            value={values.metaTitle ?? ''}
            onChange={(e) => update('metaTitle', e.target.value)}
          />
        </FormField>

        <FormField
          label="SEO description"
          htmlFor="cat-meta-desc"
          hint="Optional. Max 320 chars."
        >
          <input
            id="cat-meta-desc"
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
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create category'}
        </button>
        <Link
          href="/admin/categories"
          className="rounded-full border border-brand-line bg-white px-5 py-2 text-[0.9rem] font-semibold text-brand-ink hover:bg-brand-cream"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
