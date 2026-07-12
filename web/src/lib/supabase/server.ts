import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to web/.env.local.'
    );
  }
  const jar = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            jar.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — cookies are read-only here;
          // proxy.ts refreshes tokens instead.
        }
      },
    },
  });
}

export async function getServerSession() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getServerAccessToken(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
