'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { CategoryForm } from '@/components/features/admin/CategoryForm';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCategory } from '@/types/admin';

export function EditCategoryClient({ id }: { id: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [category, setCategory] = useState<AdminCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .getCategory(id, token)
      .then((data) => {
        if (!ignore) setCategory(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id, token, hydrated]);

  return (
    <AccountCard
      title="Edit category"
      subtitle={category ? category.name : 'Loading…'}
    >
      {error && (
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {category && <CategoryForm initial={category} />}
    </AccountCard>
  );
}
