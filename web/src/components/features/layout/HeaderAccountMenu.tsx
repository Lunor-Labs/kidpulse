'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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

  if (!hydrated || !user) {
    return (
      <Link href="/login" className="flex items-center gap-1.5 transition-colors hover:text-brand-gold">
        <LoginIcon />
        Login
      </Link>
    );
  }

  const initial = (user.fullName?.trim()?.[0] ?? user.email[0] ?? '?').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 transition-colors hover:text-brand-gold"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-brand-gold text-[0.85rem] font-bold text-brand-indigo">
          {initial}
        </span>
        <span className="hidden max-w-[120px] truncate lg:inline">
          {user.fullName ?? user.email}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-[220px] overflow-hidden rounded-[14px] border border-brand-line bg-white text-brand-ink shadow-[0_20px_40px_rgba(27,11,128,0.16)]"
        >
          <div className="border-b border-brand-line px-4 py-3">
            <div className="text-[0.78rem] font-semibold text-brand-ink-soft">Signed in as</div>
            <div className="truncate text-[0.9rem] font-bold">{user.email}</div>
          </div>
          <nav className="flex flex-col text-[0.9rem]">
            <Link href="/account/profile" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-brand-cream">
              Profile
            </Link>
            <Link href="/account/orders" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-brand-cream">
              My orders
            </Link>
            <Link href="/account/wishlist" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-brand-cream">
              Wishlist
            </Link>
            <Link href="/account/addresses" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-brand-cream">
              Addresses
            </Link>
            <Link href="/account/cards" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-brand-cream">
              Saved cards
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="border-t border-brand-line px-4 py-2 text-left text-brand-berry hover:bg-brand-cream"
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
