import Image from 'next/image';
import Link from 'next/link';
import { CartButton } from '@/components/features/cart/CartButton';
import { MobileMenu } from './MobileMenu';

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-[15px] top-1/2 h-4 w-4 -translate-y-1/2 opacity-45"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center gap-7 bg-brand-indigo px-8 py-3.5 shadow-[0_2px_16px] shadow-brand-indigo/18 max-[980px]:gap-4 relative">
      <MobileMenu />

      <Link href="/" aria-label="KidPulse home" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
        <Image
          src="/images/logo.png"
          alt="KidPulse"
          width={180}
          height={60}
          priority
          className="h-[60px] w-auto"
        />
      </Link>

      <div className="relative max-w-[480px] flex-1 max-[980px]:order-3 max-[980px]:basis-full max-[980px]:max-w-full">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search painting kits, STEM toys, gifts..."
          aria-label="Search products"
          className="w-full rounded-full border-none bg-white py-[11px] pl-[42px] pr-[18px] font-sans text-[0.92rem] text-brand-ink placeholder:text-brand-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-sky/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-5 text-[0.9rem] font-semibold text-white">
        <Link href="#" className="flex items-center gap-1.5 transition-colors hover:text-brand-gold">
          <WishlistIcon />
          Wishlist
        </Link>
        <Link href="/login" className="flex items-center gap-1.5 transition-colors hover:text-brand-gold">
          <LoginIcon />
          Login
        </Link>
        <CartButton />
      </div>
    </header>
  );
}
