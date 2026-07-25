'use client';

import { useEffect } from 'react';
import { jwtVerify } from 'jose';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { apiClient } from '@/lib/apiClient';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET ?? '';

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
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const role =
          payload.role === 'staff' || payload.role === 'super_admin'
            ? (payload.role as 'staff' | 'super_admin')
            : 'customer';

        if (!ignore) {
          setSession(
            {
              id: payload.sub ?? '',
              email: typeof payload.email === 'string' ? payload.email : '',
              fullName: typeof payload.fullName === 'string' ? payload.fullName : null,
              role,
            },
            token
          );

          const ids = await fetchWishlistIds(token);
          if (!ignore) setWishlist(ids);
        }
      } catch {
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