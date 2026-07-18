'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCard } from '@/components/features/account/AccountCard';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminStaffRow } from '@/types/admin';

const roleLabel: Record<'staff' | 'super_admin', string> = {
  staff: 'Staff',
  super_admin: 'Super Admin',
};

function shortDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function StaffClient() {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<AdminStaffRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'staff' as 'staff' | 'super_admin',
  });
  const [saving, setSaving] = useState(false);

  const notSuperAdmin = hydrated && user?.role !== 'super_admin';

  async function load() {
    if (!hydrated) return;
    if (notSuperAdmin) return;
    setRows(null);
    setError(null);
    try {
      const data = await adminApi.listStaff(token);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }
    setSaving(true);
    try {
      await adminApi.createStaff(
        {
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim() || null,
          role: form.role,
        },
        token
      );
      toast.success('Staff account created');
      setForm({ email: '', fullName: '', password: '', role: 'staff' });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create staff');
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(row: AdminStaffRow, role: 'staff' | 'super_admin') {
    try {
      await adminApi.updateStaff(row.id, { role, isActive: row.isActive }, token);
      toast.success(`${row.email ?? row.id}: role → ${roleLabel[role]}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    }
  }

  async function handleToggleActive(row: AdminStaffRow) {
    try {
      await adminApi.updateStaff(row.id, { role: row.role, isActive: !row.isActive }, token);
      toast.success(`${row.email ?? row.id}: ${row.isActive ? 'deactivated' : 'reactivated'}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  }

  async function handleRemove(row: AdminStaffRow) {
    if (!window.confirm(`Delete ${row.email ?? row.id}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteStaff(row.id, token);
      toast.success('Staff removed');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  if (notSuperAdmin) {
    return (
      <AccountCard
        title="Staff"
        subtitle="Only Super Admins can manage staff accounts."
      >
        <p className="text-[0.9rem] text-brand-berry">
          Your role ({user?.role ?? 'unknown'}) does not have permission for this page.
        </p>
      </AccountCard>
    );
  }

  return (
    <AccountCard title="Staff" subtitle="Create, deactivate and manage staff accounts.">
      <form
        onSubmit={handleCreate}
        className="mb-6 rounded-[12px] border border-brand-line p-4"
      >
        <div className="mb-3 text-[0.85rem] font-semibold text-brand-ink">
          Invite a new staff account
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] outline-none focus:border-brand-indigo"
            />
          </label>
          <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
            Full name
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
              className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] outline-none focus:border-brand-indigo"
            />
          </label>
          <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
            Temporary password (min 12 chars)
            <input
              type="text"
              required
              minLength={12}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 font-mono text-[0.88rem] outline-none focus:border-brand-indigo"
            />
          </label>
          <label className="flex flex-col text-[0.72rem] uppercase tracking-widest text-brand-ink-soft">
            Role
            <select
              value={form.role}
              onChange={(e) =>
                setForm((s) => ({ ...s, role: e.target.value as 'staff' | 'super_admin' }))
              }
              className="mt-1 rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.88rem] outline-none focus:border-brand-indigo"
            >
              <option value="staff">Staff</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create staff account'}
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-4 rounded-[10px] border border-brand-berry/30 bg-brand-berry/5 px-4 py-2 text-[0.85rem] text-brand-berry">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="text-[0.9rem] text-brand-ink-soft">Loading staff…</p>
      )}
      {rows && rows.length === 0 && (
        <p className="text-[0.9rem] text-brand-ink-soft">No staff accounts yet.</p>
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[12px] border border-brand-line">
          <table className="w-full min-w-[720px] border-collapse text-[0.86rem]">
            <thead className="bg-brand-cream/50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-brand-ink">Account</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Role</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Status</th>
                <th className="px-3 py-2 font-semibold text-brand-ink">Last sign-in</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelf = row.id === user?.id;
                return (
                  <tr key={row.id} className="border-t border-brand-line align-top">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-brand-ink">
                        {row.fullName ?? '(no name)'}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-brand-cream px-2 py-[1px] text-[0.66rem] font-semibold uppercase tracking-wider text-brand-ink-soft">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[0.72rem] text-brand-ink-soft">{row.email}</div>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.role}
                        disabled={isSelf}
                        onChange={(e) =>
                          handleRoleChange(row, e.target.value as 'staff' | 'super_admin')
                        }
                        className="rounded-[8px] border border-brand-line bg-white px-2 py-1 text-[0.82rem] disabled:opacity-50"
                      >
                        <option value="staff">Staff</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          row.isActive
                            ? 'rounded-full bg-emerald-50 px-2 py-[2px] text-[0.72rem] font-semibold text-emerald-700'
                            : 'rounded-full bg-brand-berry/10 px-2 py-[2px] text-[0.72rem] font-semibold text-brand-berry'
                        }
                      >
                        {row.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-brand-ink-soft">
                      {shortDate(row.lastSignInAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleToggleActive(row)}
                          className="rounded-full border border-brand-line px-3 py-1 text-[0.74rem] font-semibold text-brand-ink hover:bg-brand-cream disabled:opacity-50"
                        >
                          {row.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleRemove(row)}
                          className="rounded-full border border-brand-berry/40 px-3 py-1 text-[0.74rem] font-semibold text-brand-berry hover:bg-brand-berry/5 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AccountCard>
  );
}
