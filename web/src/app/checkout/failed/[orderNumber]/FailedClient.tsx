'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storefrontApi } from '@/lib/storefrontApi';
import { useAuthStore } from '@/stores/authStore';
import type { Order, PayHereStartFields } from '@/types/catalog';

const MAX_ATTEMPTS = 3;

function submitPayHereForm(fields: PayHereStartFields): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = fields.action;
  form.style.display = 'none';
  const entries: Array<[string, string]> = Object.entries(fields).filter(
    ([key]) => key !== 'action'
  ) as Array<[string, string]>;
  for (const [key, value] of entries) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export function FailedClient({ orderNumber }: { orderNumber: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!hydrated || !token) return;
    storefrontApi
      .getOrder(orderNumber, token)
      .then((data) => setOrder(data))
      .catch((err: Error) => setError(err.message));
  }, [orderNumber, token, hydrated]);

  async function handleRetry() {
    setRetrying(true);
    setError(null);
    try {
      const fields = await storefrontApi.startPayHere(orderNumber, token);
      submitPayHereForm(fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to retry payment');
      setRetrying(false);
    }
  }

  const attempts = order?.paymentAttempts ?? 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attempts);
  const outOfAttempts = attemptsLeft === 0;

  return (
    <div className="mx-auto max-w-xl px-8 py-12 text-center">
      <div className="mb-3 text-5xl">😕</div>
      <h1 className="mb-2 font-chewy text-[2rem] text-brand-berry">Payment didn&apos;t go through</h1>
      <p className="mb-6 text-brand-ink-soft">
        Your cart is preserved on order <strong>{orderNumber}</strong>.
      </p>
      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-3 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {token ? (
        <>
          {outOfAttempts ? (
            <div className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 p-4 text-[0.9rem] text-brand-berry">
              You&apos;ve reached the retry limit for this order. Please contact support if you&apos;d like
              to complete this purchase.
            </div>
          ) : (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="mb-3 inline-block rounded-full bg-brand-indigo px-6 py-3 font-bold text-white hover:opacity-90 disabled:opacity-60"
            >
              {retrying ? 'Redirecting…' : 'Retry payment'}
            </button>
          )}
        </>
      ) : (
        <p className="mb-4 text-[0.9rem] text-brand-ink-soft">
          <Link href={`/login?next=/checkout/failed/${orderNumber}`} className="text-brand-indigo hover:underline">
            Sign in
          </Link>{' '}
          to retry payment or view your order.
        </p>
      )}
      <div>
        <Link
          href="/account/orders"
          className="mt-2 inline-block text-brand-indigo hover:underline"
        >
          Go to my orders →
        </Link>
      </div>
    </div>
  );
}
