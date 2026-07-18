'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, isAdminRole } from '@/stores/authStore';
import { ADMIN_NAV_LINKS, NAV_LINKS } from '@/config/nav';

function isActive(href: string, pathname: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  const [path, query] = href.split('?');
  if (query) return pathname === path;
  return pathname === href || pathname.startsWith(href + '/');
}

export function PrimaryNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) return <nav className="max-[980px]:hidden" aria-hidden />;

  const links = isAdminRole(user?.role)
    ? ADMIN_NAV_LINKS.filter((l) => !l.superAdminOnly || user?.role === 'super_admin').map(
        (l) => ({ href: l.href, label: l.label })
      )
    : NAV_LINKS.map((l) => ({ href: l.href, label: l.label }));

  return (
    <nav
      aria-label="Primary"
      className="max-[980px]:hidden flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {links.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[0.88rem] font-semibold transition-colors ${
              active
                ? 'bg-brand-gold text-brand-indigo'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
