'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { HomeBannerForm } from '@/components/features/admin/HomeBannerForm';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminHomeBanner } from '@/types/admin';

export function EditBannerClient({ id }: { id: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [banner, setBanner] = useState<AdminHomeBanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .getBanner(id, token)
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
      title="Edit banner"
      subtitle={banner ? banner.headline : 'Loading…'}
    >
      {error && (
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {banner && <HomeBannerForm initial={banner} />}
    </AccountCard>
  );
}
