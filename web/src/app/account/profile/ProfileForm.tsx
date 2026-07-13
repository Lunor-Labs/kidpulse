'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type { Profile } from '@/types/account';

export function ProfileForm() {
  const token = useAuthStore((s) => s.accessToken);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    apiClient
      .get<Profile>('/api/v1/account/profile', token)
      .then((data) => {
        if (ignore) return;
        setProfile(data);
        setFullName(data.fullName ?? '');
        setPhone(data.phone ?? '');
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token]);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const updated = await apiClient.put<Profile>(
        '/api/v1/account/profile',
        { fullName: fullName.trim() || null, phone: phone.trim() || null },
        token
      );
      setProfile(updated);
      toast.success('Profile saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[0.9rem] text-brand-ink-soft">Loading…</p>;

  return (
    <form onSubmit={handle} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">Email</label>
        <input
          type="email"
          value={profile?.email ?? ''}
          readOnly
          className="w-full rounded-[12px] border border-brand-line bg-brand-cream px-4 py-3 text-[0.95rem] text-brand-ink-soft"
        />
      </div>
      <div>
        <label htmlFor="fullName" className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className="w-full rounded-[12px] border border-brand-line bg-white px-4 py-3 text-[0.95rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-[0.82rem] font-semibold text-brand-ink">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          placeholder="+94 77 123 4567"
          className="w-full rounded-[12px] border border-brand-line bg-white px-4 py-3 text-[0.95rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-[12px] bg-brand-indigo px-6 py-3 text-[0.9rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
