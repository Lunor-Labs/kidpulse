'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PasswordField } from '@/components/features/auth/PasswordField';

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      router.push('/account/profile');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to reset password');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <PasswordField
        value={password}
        onChange={setPassword}
        showStrength
        label="New password"
        autoComplete="new-password"
        disabled={loading}
      />
      <PasswordField
        id="confirm"
        name="confirm"
        value={confirm}
        onChange={setConfirm}
        label="Confirm password"
        autoComplete="new-password"
        disabled={loading}
      />
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
        {loading ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
}
