import Link from 'next/link';
import Image from 'next/image';
import { CartButton } from '@/components/features/cart/CartButton';
import { HeaderAccountMenu } from './HeaderAccountMenu';
import { PrimaryNav } from './PrimaryNav';
import { SearchBar } from '@/components/features/search/SearchBar';
import { WishlistLink } from './WishlistLink';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center gap-5 bg-brand-indigo px-8 py-3.5 shadow-[0_2px_16px] shadow-brand-indigo/18 max-[980px]:gap-3 max-[980px]:px-4 relative">
      <Link href="/" aria-label="KidPulse home" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
        <Image
          src="/images/logo.png"
          alt="KidPulse"
          width={180}
          height={60}
          priority
          className="h-[60px] w-auto max-[980px]:h-[44px]"
        />
      </Link>

      <PrimaryNav />

      <SearchBar />

      <div className="ml-auto flex items-center gap-5 text-[0.9rem] font-semibold text-white max-[980px]:gap-3">
        <WishlistLink />
        <CartButton />
        <HeaderAccountMenu />
      </div>
    </header>
  );
}
