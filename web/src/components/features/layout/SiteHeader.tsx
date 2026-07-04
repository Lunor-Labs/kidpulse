import Image from 'next/image';
import Link from 'next/link';
import { CartButton } from '@/components/features/cart/CartButton';
import { Input } from '@/components/ui/Input';
import { NAV_LINKS } from '@/config/nav';
import { MobileMenu } from './MobileMenu';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-line bg-brand-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <MobileMenu />
        <Link href="/" aria-label="KidPulse home" className="shrink-0">
          <Image src="/images/logo.png" alt="KidPulse" width={140} height={40} priority />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-brand-ink hover:text-brand-berry">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden max-w-xs flex-1 md:block">
          <Input type="search" placeholder="Search kits, toys, gifts…" aria-label="Search products" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" aria-label="Wishlist" className="rounded-full p-2 text-xl hover:bg-brand-cream">♡</button>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
