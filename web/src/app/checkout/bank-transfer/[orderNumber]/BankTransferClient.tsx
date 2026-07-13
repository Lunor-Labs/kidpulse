'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { storefrontApi } from '@/lib/storefrontApi';
import { useAuthStore } from '@/stores/authStore';
import type { BankTransferInfo } from '@/types/catalog';

function formatLKR(v: number): string {
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BankTransferClient({ orderNumber }: { orderNumber: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const searchParams = useSearchParams();
  const isNewAccount = searchParams.get('newAccount') === '1';
  const [info, setInfo] = useState<BankTransferInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let ignore = false;
    storefrontApi
      .getBankTransfer(orderNumber, token)
      .then((data) => {
        if (!ignore) setInfo(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [orderNumber, token, hydrated]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-16">
        <h1 className="mb-3 font-chewy text-[2rem] text-brand-berry">Something went wrong</h1>
        <p className="text-brand-ink-soft">{error}</p>
        <Link
          href="/account/orders"
          className="mt-6 inline-block text-brand-indigo hover:underline"
        >
          Go to my orders →
        </Link>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-16">
        <p className="text-brand-ink-soft">Loading bank details…</p>
      </div>
    );
  }

  const { order, bank } = info;
  const rows: Array<[string, string | null]> = [
    ['Account name', bank.accountName],
    ['Bank', bank.bankName],
    ['Branch', bank.branch],
    ['Account #', bank.accountNumber],
  ];

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <div className="rounded-[16px] border border-brand-line bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-brand-cream p-3 text-2xl">🏦</div>
          <div>
            <h1 className="font-chewy text-[1.8rem] text-brand-indigo">
              Complete your bank transfer
            </h1>
            <p className="text-[0.88rem] text-brand-ink-soft">
              Order <strong>{order.orderNumber}</strong> · {formatLKR(order.total)}
            </p>
          </div>
        </div>

        {isNewAccount && (
          <div className="mb-4 rounded-[10px] border border-brand-indigo/30 bg-brand-indigo/5 p-3 text-[0.85rem] text-brand-indigo">
            We created an account for you. Check <strong>{order.email}</strong> for a magic-link
            sign-in.
          </div>
        )}

        <p className="mb-4 text-[0.9rem] text-brand-ink-soft">
          Please transfer <strong>{formatLKR(order.total)}</strong> to the account below within{' '}
          <strong>{bank.deadlineDays} day(s)</strong>. Include your order number{' '}
          <strong>{order.orderNumber}</strong> in the reference.
        </p>

        <table className="mb-5 w-full text-[0.9rem]">
          <tbody>
            {rows
              .filter(([, v]) => Boolean(v))
              .map(([k, v]) => (
                <tr key={k} className="border-b border-brand-line/60 last:border-none">
                  <td className="py-2 text-brand-ink-soft">{k}</td>
                  <td className="py-2 font-semibold text-brand-ink">{v}</td>
                </tr>
              ))}
            {rows.every(([, v]) => !v) && (
              <tr>
                <td className="py-2 text-brand-berry">
                  Bank details are not configured. Please contact support.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {bank.whatsappNumber && (
          <div className="mb-6 rounded-[10px] border border-brand-olive/30 bg-brand-olive/5 p-4">
            <p className="text-[0.9rem] text-brand-ink">
              After the transfer, send the deposit slip to WhatsApp
            </p>
            <a
              href={`https://wa.me/${bank.whatsappNumber.replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[1.05rem] font-bold text-brand-olive hover:underline"
            >
              {bank.whatsappNumber}
            </a>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/account/orders/${order.orderNumber}`}
            className="rounded-full bg-brand-indigo px-5 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90"
          >
            View order
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-brand-line px-5 py-2.5 text-[0.9rem] font-semibold text-brand-ink hover:bg-brand-cream"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
