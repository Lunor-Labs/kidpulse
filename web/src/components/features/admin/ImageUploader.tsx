'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { adminApi, fileToBase64 } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';

interface ImageUploaderProps {
  folder: 'products' | 'categories' | 'banners' | 'product-banners';
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

const MAX_BYTES = 4 * 1024 * 1024;

export function ImageUploader({ folder, value, onChange, label }: ImageUploaderProps) {
  const token = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error('Image is too large. Max 4MB.');
      return;
    }
    setUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const result = await adminApi.uploadImage(
        {
          filename: file.name,
          contentType: file.type,
          dataBase64,
          folder,
        },
        token
      );
      onChange(result.url);
      toast.success('Image uploaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      {label && (
        <div className="mb-1 text-[0.82rem] font-semibold text-brand-ink">{label}</div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-[12px] border border-brand-line bg-brand-cream/40">
            <Image src={value} alt="Uploaded" fill sizes="96px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-[12px] border border-dashed border-brand-line bg-brand-cream/30 text-[0.72rem] text-brand-ink-soft">
            No image
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="text-[0.82rem]"
            disabled={uploading}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="w-fit rounded-full border border-brand-line px-3 py-1 text-[0.72rem] font-semibold text-brand-berry hover:bg-brand-cream"
            >
              Remove
            </button>
          )}
          {uploading && (
            <span className="text-[0.72rem] text-brand-ink-soft">Uploading…</span>
          )}
        </div>
      </div>
    </div>
  );
}
