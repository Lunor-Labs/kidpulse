'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PasswordField } from '@/components/features/auth/PasswordField';
import { GoogleButton } from '@/components/features/auth/GoogleButton';

export function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) throw err;
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setNotice('Check your inbox to confirm your email.');
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-up failed');
      setLoading(false);
    }
  }

  return (
    <>
      <GoogleButton next={next} label="Sign up with Google" />
      <div className="my-5 flex items-center gap-3 text-[0.75rem] uppercase tracking-widest text-brand-ink-soft">
        <span className="flex-1 border-t border-brand-line" />
        or
        <span className="flex-1 border-t border-brand-line" />
      </div>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-[12px] border border-brand-line bg-white px-4 py-3 text-[0.95rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
        </div>
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
        <PasswordField
          value={password}
          onChange={setPassword}
          showStrength
          autoComplete="new-password"
          disabled={loading}
        />
        {error && (
          <p className="rounded-[10px] bg-brand-berry/10 px-3 py-2 text-[0.82rem] text-brand-berry">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-[10px] bg-brand-olive/10 px-3 py-2 text-[0.82rem] text-brand-olive">
            {notice}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[12px] bg-brand-indigo px-4 py-3 text-[0.95rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </>
  );
}
