import { AppError } from '../lib/AppError';
import { getSupabaseAdmin } from '../lib/supabaseAdmin';

export type StaffRole = 'staff' | 'super_admin';
type AnyRole = 'customer' | 'staff' | 'super_admin';

export interface StaffRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

interface SupabaseUser {
  id: string;
  email?: string | null;
  banned_until?: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
}

function readRole(u: SupabaseUser): AnyRole {
  const raw = (u.app_metadata as { role?: string } | null | undefined)?.role;
  if (raw === 'staff' || raw === 'super_admin' || raw === 'customer') return raw;
  return 'customer';
}

function readFullName(u: SupabaseUser): string | null {
  const meta = (u.user_metadata as { full_name?: string; name?: string } | null | undefined) ?? {};
  return meta.full_name ?? meta.name ?? null;
}

function isBanned(u: SupabaseUser): boolean {
  if (!u.banned_until) return false;
  const until = new Date(u.banned_until);
  if (Number.isNaN(until.getTime())) return false;
  return until.getTime() > Date.now();
}

function toRow(u: SupabaseUser): StaffRow {
  const role = readRole(u);
  return {
    id: u.id,
    email: u.email ?? null,
    fullName: readFullName(u),
    role: role === 'customer' ? 'staff' : role,
    isActive: !isBanned(u),
    createdAt: u.created_at ?? '',
    lastSignInAt: u.last_sign_in_at ?? null,
  };
}

async function listAllUsers(): Promise<SupabaseUser[]> {
  const supabase = getSupabaseAdmin();
  const PAGE = 100;
  const all: SupabaseUser[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw new AppError(error.message, 500);
    all.push(...(data.users as unknown as SupabaseUser[]));
    if (data.users.length < PAGE) break;
  }
  return all;
}

async function getUser(id: string): Promise<SupabaseUser> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data.user) throw new AppError('User not found', 404);
  return data.user as unknown as SupabaseUser;
}

export class AdminStaffService {
  async list(): Promise<StaffRow[]> {
    const users = await listAllUsers();
    return users
      .filter((u) => {
        const role = readRole(u);
        return role === 'staff' || role === 'super_admin';
      })
      .map(toRow)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async create(body: {
    email: string;
    password: string;
    fullName?: string | null;
    role: StaffRole;
  }): Promise<StaffRow> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      app_metadata: { role: body.role },
      user_metadata: body.fullName ? { full_name: body.fullName } : {},
    });
    if (error || !data.user) {
      throw new AppError(error?.message ?? 'Failed to create staff', 400);
    }
    return toRow(data.user as unknown as SupabaseUser);
  }

  async updateRole(id: string, role: StaffRole): Promise<StaffRow> {
    const supabase = getSupabaseAdmin();
    const current = await getUser(id);
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { ...(current.app_metadata ?? {}), role },
    });
    if (error || !data.user) throw new AppError(error?.message ?? 'Failed', 400);
    return toRow(data.user as unknown as SupabaseUser);
  }

  async setActive(id: string, active: boolean): Promise<StaffRow> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: active ? 'none' : '87600h',
    } as unknown as Parameters<typeof supabase.auth.admin.updateUserById>[1]);
    if (error || !data.user) throw new AppError(error?.message ?? 'Failed', 400);
    return toRow(data.user as unknown as SupabaseUser);
  }

  async remove(id: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw new AppError(error.message, 400);
  }
}
