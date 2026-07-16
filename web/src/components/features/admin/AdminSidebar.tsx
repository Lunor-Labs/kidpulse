'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const LINKS: Array<{ href: string; label: string; superAdminOnly?: boolean }> = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/banners', label: 'Home banners' },
  { href: '/admin/product-banners', label: 'Product banners' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/discounts', label: 'Auto-discounts' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/staff', label: 'Staff', superAdminOnly: true },
  { href: '/admin/action-log', label: 'Action log', superAdminOnly: true },
];

export function AdminSidebar() {
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
    <aside className="lg:sticky lg:top-[100px] lg:w-[240px] lg:shrink-0">
      <div className="rounded-[16px] border border-brand-line bg-white p-5">
        <div className="mb-4 border-b border-brand-line pb-4">
          <div className="text-[0.72rem] font-semibold uppercase tracking-widest text-brand-berry">
            Admin
          </div>
          <div className="mt-1 truncate text-[0.95rem] font-bold text-brand-ink">
            {user?.fullName ?? user?.email ?? 'Staff'}
          </div>
          {user?.role && (
            <div className="mt-1 inline-block rounded-full bg-brand-cream px-2 py-[1px] text-[0.66rem] font-semibold uppercase tracking-wider text-brand-ink-soft">
              {user.role.replace('_', ' ')}
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {LINKS.filter(
            (link) => !link.superAdminOnly || user?.role === 'super_admin'
          ).map((link) => {
            const active =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname === link.href || pathname.startsWith(link.href + '/');
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
          <Link
            href="/"
            className="mt-3 rounded-[10px] border border-brand-line px-3 py-2 text-left text-[0.9rem] font-semibold text-brand-ink hover:bg-brand-cream"
          >
            ← Back to store
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="rounded-[10px] border border-brand-line px-3 py-2 text-left text-[0.9rem] font-semibold text-brand-berry hover:bg-brand-cream"
          >
            Sign out
          </button>
        </nav>
      </div>
    </aside>
  );
}
