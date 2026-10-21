'use client';

import { useEffect, useState } from 'react';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi, downloadCsv } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export function NewsletterSubscribersClient() {
  const token = useAuthStore((s) => s.accessToken);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .listNewsletterSubscribers(token)
      .then((res) => {
        setSubscribers(res.data ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => {
        setSubscribers([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadCsv(
        '/api/v1/admin/newsletter/subscribers/csv',
        'newsletter-subscribers.csv',
        token
      );
    } finally {
      setExporting(false);
    }
  }

  const subtitle = loading
    ? 'Loading…'
    : `${total} active subscriber${total !== 1 ? 's' : ''}`;

  return (
    <AccountCard title="Newsletter subscribers" subtitle={subtitle}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting || loading}
          className="rounded-full bg-brand-indigo px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {loading ? (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>
      ) : subscribers.length === 0 ? (
        <p className="text-[0.9rem] text-brand-ink-soft">No subscribers yet.</p>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-brand-line">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/50 text-left text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-brand-cream/30">
                  <td className="px-4 py-3 text-brand-ink">{s.email}</td>
                  <td className="px-4 py-3 text-brand-ink-soft">
                    {new Date(s.subscribedAt).toLocaleDateString('en-LK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountCard>
  );
}