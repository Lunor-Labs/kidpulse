'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { CouponForm } from '@/components/features/admin/CouponForm';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminCoupon } from '@/types/admin';

export function EditCouponClient({ id }: { id: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [row, setRow] = useState<AdminCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .getCoupon(id, token)
      .then((data) => {
        if (!ignore) setRow(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id, token, hydrated]);

  return (
    <AccountCard title="Edit coupon" subtitle="Update discount details or deactivate the code.">
      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!row && !error && <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>}
      {row && <CouponForm initial={row} />}
    </AccountCard>
  );
}
