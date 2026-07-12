'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { ProductForm } from '@/components/features/admin/ProductForm';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminProduct } from '@/types/admin';

export function EditProductClient({ id }: { id: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    adminApi
      .getProduct(id, token)
      .then((data) => {
        if (!ignore) setProduct(data);
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
      title="Edit product"
      subtitle={product ? product.name : 'Loading…'}
    >
      {error && (
        <p className="rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {product && <ProductForm initial={product} />}
    </AccountCard>
  );
}
