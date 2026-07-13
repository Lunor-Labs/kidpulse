import Link from 'next/link';
import Image from 'next/image';
import { CartButton } from '@/components/features/cart/CartButton';
import { HeaderAccountMenu } from './HeaderAccountMenu';
import { MobileMenu } from './MobileMenu';
import { SearchBar } from '@/components/features/search/SearchBar';

function WishlistIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
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

      <SearchBar />

      <div className="ml-auto flex items-center gap-5 text-[0.9rem] font-semibold text-white">
        <Link
          href="/account/wishlist"
          className="flex items-center gap-1.5 transition-colors hover:text-brand-gold"
        >
          <WishlistIcon />
          Wishlist
        </Link>
        <HeaderAccountMenu />
        <CartButton />
      </div>
    </header>
  );
}