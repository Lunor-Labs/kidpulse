'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NAV_LINKS } from '@/config/nav';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-full p-2 text-xl hover:bg-brand-cream"
      >
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-brand-line bg-brand-paper px-6 py-4 shadow-lg"
        >
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-1 text-base font-medium text-brand-ink hover:text-brand-berry"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
