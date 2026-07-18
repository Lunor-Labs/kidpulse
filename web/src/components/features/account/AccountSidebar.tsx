'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const LINKS = [
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/orders', label: 'My orders' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/cards', label: 'Saved cards' },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  async function signOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="max-[980px]:hidden lg:sticky lg:top-[100px] lg:w-[240px] lg:shrink-0">
      <div className="rounded-[16px] border border-brand-line bg-white p-5">
        <div className="mb-4 border-b border-brand-line pb-4">
          <div className="text-[0.72rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
            Account
          </div>
          <div className="mt-1 truncate text-[0.95rem] font-bold text-brand-ink">
            {user?.fullName ?? user?.email ?? 'Guest'}
          </div>
          {user?.email && user.fullName && (
            <div className="truncate text-[0.78rem] text-brand-ink-soft">{user.email}</div>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[10px] px-3 py-2 text-[0.9rem] font-semibold transition-colors ${
                  active
                    ? 'bg-brand-indigo text-white'
                    : 'text-brand-ink hover:bg-brand-cream'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={signOut}
            className="mt-3 rounded-[10px] border border-brand-line px-3 py-2 text-left text-[0.9rem] font-semibold text-brand-berry hover:bg-brand-cream"
          >
            Sign out
          </button>
        </nav>
      </div>
    </aside>
  );
}
