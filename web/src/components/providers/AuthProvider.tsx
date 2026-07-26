'use client';

import { useEffect } from 'react';
import { useAuthStore, type SessionRole, type SessionUser } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { apiClient } from '@/lib/apiClient';

// The browser can't verify the token's signature — that would mean shipping the
// HMAC key to every visitor. `/me` is the authority: it 401s on a bad or expired
// token, which is the same signal jwtVerify() used to give us.
async function fetchSession(token: string): Promise<SessionUser> {
  const { user } = await apiClient.get<{ user: SessionUser }>('/api/v1/auth/me', token);
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? null,
    role: normalizeRole(user.role),
  };
}

function normalizeRole(role: unknown): SessionRole {
  return role === 'staff' || role === 'super_admin' ? role : 'customer';
}

async function fetchWishlistIds(token: string): Promise<string[]> {
  try {
    return await apiClient.get<string[]>('/api/v1/account/wishlist/ids', token);
  } catch {
    return [];
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
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

      try {
        const user = await fetchSession(token);
        if (ignore) return;

        setSession(user, token);

        const ids = await fetchWishlistIds(token);
        if (!ignore) setWishlist(ids);
      } catch {
        if (ignore) return;
        clear();
        clearWishlist();
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, [setSession, clear, setWishlist, clearWishlist]);

  return <>{children}</>;
}
