'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[12px] bg-brand-olive/10 p-4 text-[0.9rem] text-brand-olive">
        If an account exists for <strong>{email}</strong>, a reset link is on its way.
      </div>
    );
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-[12px] border border-brand-line bg-white px-4 py-3 text-[0.95rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>
      {error && (
        <p className="rounded-[10px] bg-brand-berry/10 px-3 py-2 text-[0.82rem] text-brand-berry">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[12px] bg-brand-indigo px-4 py-3 text-[0.95rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}
