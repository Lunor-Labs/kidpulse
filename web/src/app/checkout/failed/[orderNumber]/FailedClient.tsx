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

  const entries = Object.entries(fields).filter(
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
    if (!token) return;

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

  const whatsappUrl = `https://wa.me/94XXXXXXXXX?text=Hi%2C%20I%20need%20help%20with%20my%20order%20${encodeURIComponent(
    orderNumber
  )}`;

  const emailUrl = `mailto:orders@kidpulse.lk?subject=Payment%20help%20for%20order%20${encodeURIComponent(
    orderNumber
  )}`;

  return (
    <div className="mx-auto max-w-xl px-8 py-12 text-center">
      {/* Icon + heading */}
      <div className="mb-3 text-5xl">😕</div>

      <h1 className="mb-2 font-chewy text-[2rem] text-brand-berry">
        Payment didn&apos;t go through
      </h1>

      <p className="mb-6 text-brand-ink-soft">
        Your cart is preserved on order <strong>{orderNumber}</strong>.
      </p>

      {/* Error message */}
      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-3 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}

      {token ? (
        <>
          {outOfAttempts ? (
            <div className="mb-6 rounded-[16px] border border-brand-berry/30 bg-brand-berry/5 p-6 text-left">
              <p className="mb-3 text-[0.95rem] font-bold text-brand-berry">
                ⚠️ Payment attempt limit reached
              </p>

              <p className="mb-4 text-[0.88rem] leading-relaxed text-brand-ink-soft">
                You&apos;ve used all 3 payment attempts for order{' '}
                <strong className="text-brand-ink">{orderNumber}</strong>.
                Please contact our support team and we&apos;ll help you
                complete your purchase manually.
              </p>

              {/* Support options */}
              <div className="flex flex-col gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-[12px] bg-[#25D366] px-5 py-3 text-[0.9rem] font-bold text-white transition-opacity hover:opacity-90"
                >
                  💬 Contact us on WhatsApp
                </a>

                <a
                  href={emailUrl}
                  className="flex items-center justify-center gap-2 rounded-[12px] border border-brand-indigo/20 bg-white px-5 py-3 text-[0.9rem] font-bold text-brand-indigo transition-colors hover:border-brand-indigo"
                >
                  ✉️ Email support
                </a>
              </div>

              <p className="mt-4 text-center text-[0.78rem] text-brand-ink-soft">
                Please quote your order number <strong>{orderNumber}</strong>{' '}
                when contacting us.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="mb-3 inline-block rounded-full bg-brand-indigo px-8 py-3 font-bold text-white hover:opacity-90 disabled:opacity-60"
              >
                {retrying ? 'Redirecting…' : 'Retry payment'}
              </button>

              <p className="text-[0.82rem] text-brand-ink-soft">
                {attemptsLeft === 1
                  ? '⚠️ This is your last payment attempt for this order.'
                  : `You have ${attemptsLeft} attempt${
                      attemptsLeft !== 1 ? 's' : ''
                    } remaining.`}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mb-4 text-[0.9rem] text-brand-ink-soft">
          <Link
            href={`/login?next=/checkout/failed/${orderNumber}`}
            className="text-brand-indigo hover:underline"
          >
            Sign in
          </Link>{' '}
          to retry payment or view your order.
        </p>
      )}

      {/* Navigation */}
      <div className="mt-2 flex flex-col items-center gap-3">
        <Link
          href="/products"
          className="rounded-full bg-brand-cream px-6 py-2.5 text-[0.88rem] font-bold text-brand-indigo hover:bg-brand-line"
        >
          Continue shopping
        </Link>

        <Link
          href="/account/orders"
          className="text-[0.85rem] text-brand-indigo hover:underline"
        >
          Go to my orders →
        </Link>
      </div>
    </div>
  );
}
