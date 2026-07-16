'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PasswordField } from '@/components/features/auth/PasswordField';
import { GoogleButton } from '@/components/features/auth/GoogleButton';

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) throw err;
      const role = (data.user?.app_metadata as { role?: string } | undefined)?.role;
      const isAdmin = role === 'staff' || role === 'super_admin';
      const target = nextParam || (isAdmin ? '/admin' : '/');
      router.push(target);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
      setLoading(false);
    }
  }

  return (
    <>
      <GoogleButton next={nextParam ?? undefined} />
      <div className="my-5 flex items-center gap-3 text-[0.75rem] uppercase tracking-widest text-brand-ink-soft">
        <span className="flex-1 border-t border-brand-line" />
        or
        <span className="flex-1 border-t border-brand-line" />
      </div>
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
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={loading}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[0.82rem] font-semibold text-brand-indigo hover:underline"
          >
            Forgot password?
          </Link>
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  );
}
