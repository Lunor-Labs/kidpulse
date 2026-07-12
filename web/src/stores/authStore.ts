'use client';

import { create } from 'zustand';

export type SessionRole = 'customer' | 'staff' | 'super_admin';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  role: SessionRole;
}

interface AuthState {
  user: SessionUser | null;
  hydrated: boolean;
  accessToken: string | null;
  setSession: (user: SessionUser | null, accessToken: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  accessToken: null,
  setSession: (user, accessToken) => set({ user, accessToken, hydrated: true }),
  clear: () => set({ user: null, accessToken: null, hydrated: true }),
}));

export function isAdminRole(role: SessionRole | undefined | null): boolean {
  return role === 'staff' || role === 'super_admin';
}
