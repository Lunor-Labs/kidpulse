'use client';

import { useState } from 'react';

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-[16px] border border-brand-line bg-white p-6">
      <form onSubmit={submit} className="mb-2">
        <div className="mb-4">
          <label htmlFor="track-order-number" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
            Order number
          </label>
          <input
            id="track-order-number"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. KP-10234"
            required
            className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="track-order-email" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
            Email used at checkout
          </label>
          <input
            id="track-order-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
        </div>

        <button
          type="submit"
          className="rounded-[12px] bg-brand-indigo px-5 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90"
        >
          Track order
        </button>
      </form>

      {submitted && (
        <p className="mt-4 rounded-[10px] bg-brand-cream px-4 py-3 text-[0.85rem] text-brand-ink">
          Guest order tracking is coming soon. In the meantime, check your order confirmation
          email, or reach out on our Contact page with your order number and we&rsquo;ll look it
          up for you.
        </p>
      )}
    </div>
  );
}
