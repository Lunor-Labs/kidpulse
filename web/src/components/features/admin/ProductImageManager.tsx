'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { adminApi, fileToBase64 } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';

export interface ProductImageInput {
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface ProductImageManagerProps {
  value: ProductImageInput[];
  onChange: (imgs: ProductImageInput[]) => void;
}

const MAX_BYTES = 4 * 1024 * 1024;

export function ProductImageManager({ value, onChange }: ProductImageManagerProps) {
  const token = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      const uploaded: ProductImageInput[] = [];
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is larger than 4MB`);
          continue;
        }
        const dataBase64 = await fileToBase64(file);
        const result = await adminApi.uploadImage(
          {
            filename: file.name,
            contentType: file.type,
            dataBase64,
            folder: 'products',
          },
          token
        );
        uploaded.push({
          url: result.url,
          altText: null,
          sortOrder: value.length + uploaded.length,
        });
      }
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function updateAlt(idx: number, alt: string) {
    onChange(value.map((img, i) => (i === idx ? { ...img, altText: alt || null } : img)));
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sortOrder: i })));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          }}
          className="text-[0.82rem]"
          disabled={uploading}
        />
        {uploading && (
          <span className="text-[0.72rem] text-brand-ink-soft">Uploading…</span>
        )}
      </div>
      {value.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-brand-line bg-brand-cream/30 px-4 py-3 text-[0.82rem] text-brand-ink-soft">
          No images yet. Add up to 12 images (max 4MB each).
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {value.map((img, idx) => (
            <li
              key={`${img.url}-${idx}`}
              className="flex items-center gap-3 rounded-[12px] border border-brand-line bg-white p-2"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-brand-cream/40">
                <Image src={img.url} alt={img.altText ?? ''} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Alt text"
                  className="w-full rounded-[8px] border border-brand-line px-2 py-1 text-[0.82rem]"
                  value={img.altText ?? ''}
                  onChange={(e) => updateAlt(idx, e.target.value)}
                />
                <div className="mt-1 text-[0.7rem] text-brand-ink-soft">#{idx + 1}</div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-full border border-brand-line px-2 py-[1px] text-[0.72rem] disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === value.length - 1}
                  className="rounded-full border border-brand-line px-2 py-[1px] text-[0.72rem] disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded-full border border-brand-line px-2 py-[1px] text-[0.72rem] text-brand-berry"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
