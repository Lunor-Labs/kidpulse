'use client';

import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';

async function fetchWishlistIds(token: string): Promise<string[]> {
  try {
    return await apiClient.get<string[]>('/api/v1/account/wishlist/ids', token);
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const setWishlist = useWishlistStore((s) => s.setIds);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      clear();
      return;
    }

    let ignore = false;

    supabase.auth.getSession().then(async (result: { data: { session: Session | null } }) => {
      if (ignore) return;
      const session = result.data.session;
      if (!session?.user) {
        clear();
        clearWishlist();
        return;
      }
      const meta = session.user.user_metadata as { full_name?: string; name?: string };
      const appMeta = (session.user.app_metadata ?? {}) as { role?: string };
      const role =
        appMeta.role === 'staff' || appMeta.role === 'super_admin'
          ? appMeta.role
          : 'customer';
      setSession(
        {
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: meta.full_name ?? meta.name ?? null,
          role,
        },
        session.access_token
      );
      const ids = await fetchWishlistIds(session.access_token);
      if (!ignore) setWishlist(ids);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (!session?.user) {
        clear();
        clearWishlist();
        return;
      }
      const meta = session.user.user_metadata as { full_name?: string; name?: string };
      const appMeta = (session.user.app_metadata ?? {}) as { role?: string };
      const role =
        appMeta.role === 'staff' || appMeta.role === 'super_admin'
          ? appMeta.role
          : 'customer';
      setSession(
        {
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: meta.full_name ?? meta.name ?? null,
          role,
        },
        session.access_token
      );
      const ids = await fetchWishlistIds(session.access_token);
      setWishlist(ids);
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, [setSession, clear, setWishlist, clearWishlist]);

  return <>{children}</>;
}
