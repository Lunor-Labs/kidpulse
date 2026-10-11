'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi, fileToBase64 } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';

interface MomentsItem {
  id: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

export function MomentsListClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [rows, setRows] = useState<MomentsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    fetch(`${API}/api/v1/admin/moments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (!ignore) setRows(d.data); })
      .catch((err: Error) => { if (!ignore) setError(err.message); });
    return () => { ignore = true; };
  }, [token, hydrated]);

  async function handleUpload(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const uploaded = await adminApi.uploadImage(
        { filename: file.name, contentType: file.type, dataBase64, folder: 'products' },
        token
      );
      const res = await fetch(`${API}/api/v1/admin/moments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: uploaded.url,
          sortOrder: rows ? rows.length : 0,
          isActive: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to save image');
      const d = await res.json();
      setRows((prev) => [...(prev ?? []), d.data]);
      toast.success('Image added to gallery');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleToggle(item: MomentsItem) {
    try {
      const res = await fetch(`${API}/api/v1/admin/moments/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: item.imageUrl,
          sortOrder: item.sortOrder,
          isActive: !item.isActive,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      const d = await res.json();
      setRows((prev) => prev?.map((r) => (r.id === item.id ? d.data : r)) ?? null);
      toast.success(d.data.isActive ? 'Item shown' : 'Item hidden');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this image from the gallery?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/api/v1/admin/moments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      toast.success('Image removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSortChange(id: string, sortOrder: number) {
    const item = rows?.find((r) => r.id === id);
    if (!item) return;
    try {
      const res = await fetch(`${API}/api/v1/admin/moments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: item.imageUrl,
          isActive: item.isActive,
          sortOrder,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      const d = await res.json();
      setRows((prev) =>
        prev
          ?.map((r) => (r.id === id ? d.data : r))
          .sort((a, b) => a.sortOrder - b.sortOrder) ?? null
      );
      toast.success('Sort order updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  }

  return (
    <AccountCard
      title="Moments gallery"
      subtitle="Images shown in the 'Shared Moments with KidPulse' section on the homepage. Upload up to 11 images."
      actions={
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full bg-brand-indigo px-4 py-2 text-[0.88rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : '+ Add image'}
        </button>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
        }}
      />

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>
      )}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">
          No images yet. Click "Add image" to upload your first one.
        </p>
      )}
      {rows && rows.length > 0 && (
        <ul className="grid grid-cols-1 gap-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-4 rounded-[14px] border border-brand-line bg-white p-3"
            >
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[10px] bg-brand-cream/40">
                <Image
                  src={row.imageUrl}
                  alt="Gallery image"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 text-[0.72rem]">
                  <span
                    className={`rounded-full px-2 py-[1px] font-semibold ${
                      row.isActive
                        ? 'bg-brand-olive/15 text-brand-olive'
                        : 'bg-brand-cream text-brand-ink-soft'
                    }`}
                  >
                    {row.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-[0.75rem] text-brand-ink-soft">Sort order:</label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={row.sortOrder}
                    onBlur={(e) => handleSortChange(row.id, Number(e.target.value))}
                    className="w-16 rounded-[8px] border border-brand-line px-2 py-1 text-[0.82rem] text-brand-ink"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(row)}
                  className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-ink hover:bg-brand-cream"
                >
                  {row.isActive ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  disabled={deletingId === row.id}
                  onClick={() => handleDelete(row.id)}
                  className="rounded-full border border-brand-line px-3 py-1 text-[0.76rem] font-semibold text-brand-berry hover:bg-brand-cream disabled:opacity-60"
                >
                  {deletingId === row.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountCard>
  );
}