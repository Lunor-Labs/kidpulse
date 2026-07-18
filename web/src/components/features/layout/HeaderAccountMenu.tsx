'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { isAdminRole, useAuthStore } from '@/stores/authStore';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { ACCOUNT_NAV_LINKS, ADMIN_NAV_LINKS, NAV_LINKS } from '@/config/nav';

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function HeaderAccountMenu() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function signOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  const isAdmin = hydrated && isAdminRole(user?.role);
  const mobileNavLinks = isAdmin
    ? ADMIN_NAV_LINKS.filter((l) => !l.superAdminOnly || user?.role === 'super_admin').map(
        (l) => ({ href: l.href, label: l.label })
      )
    : NAV_LINKS.map((l) => ({ href: l.href, label: l.label }));

  if (!hydrated || !user) {
    return (
      <div ref={ref} className="relative">
        <Link
          href="/login"
          aria-label="Log in"
          className="hidden min-[981px]:inline-flex items-center gap-1.5 transition-colors hover:text-brand-gold"
        >
          <UserIcon />
          <span className="text-[0.9rem] font-semibold">Login</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-haspopup="menu"
          aria-expanded={open}
          className="min-[981px]:hidden inline-flex items-center gap-1.5 transition-colors hover:text-brand-gold"
        >
          <UserIcon />
        </button>

        {open && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 cursor-default bg-black/40 backdrop-blur-sm min-[981px]:hidden"
            />
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-40 w-[260px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain rounded-[14px] border border-brand-line bg-white text-brand-ink shadow-[0_20px_40px_rgba(27,11,128,0.24)] min-[981px]:hidden"
            >
              <nav className="flex flex-col text-[0.92rem]">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 hover:bg-brand-cream"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="border-t border-brand-line px-4 py-2.5 font-semibold text-brand-indigo hover:bg-brand-cream"
                >
                  Log in
                </Link>
              </nav>
            </div>
          </>
        )}
      </div>
    );
  }

  const initial = (user.fullName?.trim()?.[0] ?? user.email[0] ?? '?').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="flex items-center gap-2 transition-colors hover:text-brand-gold"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="hidden h-[30px] w-[30px] items-center justify-center rounded-full bg-brand-gold text-[0.85rem] font-bold text-brand-indigo min-[981px]:flex">
          {initial}
        </span>
        <span className="min-[981px]:hidden">
          <UserIcon />
        </span>
        <span className="hidden max-w-[120px] truncate lg:inline">
          {user.fullName ?? user.email}
        </span>
      </button>

      {open && (
        <>
          {/* Mobile backdrop with blur */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-black/40 backdrop-blur-sm min-[981px]:hidden"
          />
          {/* Desktop dropdown */}
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] hidden w-[240px] max-h-[calc(100vh-96px)] overflow-y-auto rounded-[14px] border border-brand-line bg-white text-brand-ink shadow-[0_20px_40px_rgba(27,11,128,0.16)] min-[981px]:block"
          >
            <div className="border-b border-brand-line px-4 py-3">
              <div className="text-[0.78rem] font-semibold text-brand-ink-soft">Signed in as</div>
              <div className="truncate text-[0.9rem] font-bold">{user.email}</div>
            </div>
            <nav className="flex flex-col text-[0.9rem]">
              {isAdmin ? (
                <>
                  <div className="px-4 pt-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
                    Admin
                  </div>
                  {mobileNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 hover:bg-brand-cream"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              ) : (
                ACCOUNT_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 hover:bg-brand-cream"
                  >
                    {link.label}
                  </Link>
                ))
              )}
              <button
                type="button"
                onClick={signOut}
                className="mt-1 border-t border-brand-line px-4 py-2 text-left font-semibold text-brand-berry hover:bg-brand-cream"
              >
                Sign out
              </button>
            </nav>
          </div>

          {/* Mobile menu: nav → sign out → separator → user details */}
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-[260px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain rounded-[14px] border border-brand-line bg-white text-brand-ink shadow-[0_20px_40px_rgba(27,11,128,0.24)] min-[981px]:hidden"
          >
            <nav className="flex flex-col text-[0.92rem]">
              {isAdmin && (
                <div className="px-4 pt-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
                  Admin
                </div>
              )}
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 hover:bg-brand-cream"
                >
                  {link.label}
                </Link>
              ))}

              {!isAdmin && (
                <>
                  <div className="mt-1 px-4 pt-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
                    Account
                  </div>
                  {ACCOUNT_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="px-4 py-2.5 hover:bg-brand-cream"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              )}

              <button
                type="button"
                onClick={signOut}
                className="mt-1 px-4 py-2.5 text-left font-semibold text-brand-berry hover:bg-brand-cream"
              >
                Sign out
              </button>
            </nav>
            <div className="border-t border-brand-line px-4 py-3">
              <div className="text-[0.72rem] font-semibold uppercase tracking-widest text-brand-ink-soft">
                Signed in as
              </div>
              {user.fullName && (
                <div className="mt-0.5 truncate text-[0.92rem] font-bold text-brand-ink">
                  {user.fullName}
                </div>
              )}
              <div className="truncate text-[0.82rem] text-brand-ink-soft">{user.email}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
