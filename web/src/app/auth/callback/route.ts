import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next');

  let role: string | undefined;
  if (code) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    role = (data.user?.app_metadata as { role?: string } | undefined)?.role;
  }

  const isAdmin = role === 'staff' || role === 'super_admin';
  const target = nextParam || (isAdmin ? '/admin' : '/');
  return NextResponse.redirect(new URL(target, url.origin));
}
