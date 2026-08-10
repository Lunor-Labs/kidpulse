'use client';

import { useEffect } from 'react';
import { useAuthStore, type SessionRole, type SessionUser } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { apiClient } from '@/lib/apiClient';

function normalizeRole(role: unknown): SessionRole {
  return role === 'staff' || role === 'super_admin' ? role : 'customer';
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function decodeToken(token: string): SessionUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName ?? null,
      role: normalizeRole(payload.role),
    };
  } catch {
    return null;
  }
}

async function fetchWishlistIds(token: string): Promise<string[]> {
  try {
    return await apiClient.get<string[]>('/api/v1/account/wishlist/ids', token);
  } catch {
    return [];
  }
}

async function validateToken(token: string): Promise<boolean> {
  try {
    await apiClient.get('/api/v1/auth/me', token);
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const setWishlist = useWishlistStore((s) => s.setIds);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    let ignore = false;

    async function init() {
      const token = getCookie('auth_token');
      if (!token) {
        clear();
        clearWishlist();
        return;
      }

      // Instantly populate store from JWT — no API call needed
      const user = decodeToken(token);
      if (!user) {
        clear();
        clearWishlist();
        return;
      }

      // Show user immediately
      if (!ignore) setSession(user, token);

      // Validate token in background + load wishlist
      const [valid, ids] = await Promise.all([
        validateToken(token),
        fetchWishlistIds(token),
      ]);

      if (ignore) return;

      if (!valid) {
        // Token was rejected by server (revoked/expired server-side)
        document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
        clear();
        clearWishlist();
        return;
      }

      setWishlist(ids);
    }

    init();

    return () => { ignore = true; };
  }, [setSession, clear, setWishlist, clearWishlist]);

  return <>{children}</>;
}