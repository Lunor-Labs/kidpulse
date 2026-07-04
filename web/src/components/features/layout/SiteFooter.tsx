import Image from 'next/image';
import Link from 'next/link';

const COLUMNS = [
  { heading: 'Shop', links: [['All Products', '/products'], ['New Arrivals', '/products?sort=new'], ['Best Sellers', '/products?bestseller=true'], ['Gift Sets', '/products?category=gift-collections']] },
  { heading: 'Company', links: [['About Us', '/about'], ['Blog', '/blog'], ['Contact', '/contact']] },
  { heading: 'Support', links: [['Track Order', '/track-order'], ['Returns', '/returns'], ['Shipping Info', '/shipping'], ['FAQs', '/faq']] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-line bg-brand-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/images/logo.png" alt="KidPulse" width={140} height={40} />
          <p className="mt-3 text-sm text-brand-ink-soft">
            Craft kits that turn screen time into hands-on play. Made with 💛 in Sri Lanka.
          </p>
          <p className="mt-4 text-xs font-semibold text-brand-ink-soft">
            We accept: PayHere · Cash on Delivery · Bank Transfer
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h4 className="font-display font-bold text-brand-indigo">{col.heading}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-brand-ink-soft hover:text-brand-berry">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-brand-line py-5 text-center text-xs text-brand-ink-soft">
        © {new Date().getFullYear()} KidPulse · Lunor Labs (Pvt) Ltd. All rights reserved.
      </div>
    </footer>
  );
}
