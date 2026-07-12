'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { ProductBannerForm } from '@/components/features/admin/ProductBannerForm';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminProductBanner } from '@/types/admin';

export function EditProductBannerClient({ id }: { id: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [banner, setBanner] = useState<AdminProductBanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .getProductBanner(id, token)
      .then((data) => {
        if (!ignore) setBanner(data);
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
      title="Edit product banner"
      subtitle={banner ? banner.headline : 'Loading…'}
    >
      {error && (
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {banner && <ProductBannerForm initial={banner} />}
    </AccountCard>
  );
}
