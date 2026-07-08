import Link from 'next/link';

const COLUMNS = [
  {
    heading: 'Shop',
    links: [
      ['All Products', '/products'],
      ['New Arrivals', '/products?sort=new'],
      ['Best Sellers', '/products?bestseller=true'],
      ['Gift Sets', '/products?category=gift-collections'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['About Us', '/about'],
      ['Blog', '/blog'],
      ['Careers', '/careers'],
      ['Contact', '/contact'],
    ],
  },
  {
    heading: 'Help',
    links: [
      ['Track Order', '/track-order'],
      ['Returns', '/returns'],
      ['Shipping Info', '/shipping'],
      ['FAQs', '/faq'],
    ],
  },
  {
    heading: 'Payments',
    links: [
      ['PayHere', '#'],
      ['Cash on Delivery', '#'],
      ['Bank Transfer', '#'],
    ],
  },
] as const;

const SOCIAL = [
  { label: 'FB', href: '#' },
  { label: 'IG', href: '#' },
  { label: 'WA', href: '#' },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-indigo-deep mt-[60px]">

      {/* Top grid */}
      <div className="mx-auto max-w-7xl px-5 pb-9 pt-14 grid gap-8 grid-cols-2 sm:px-8 md:[grid-template-columns:1.4fr_1fr_1fr_1fr_1fr]">

        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <span className="mb-[14px] block font-chewy text-[1.5rem] font-normal text-brand-sky">
            KidPulse
          </span>
          <p className="mb-[18px] text-[0.85rem] leading-relaxed text-white/55">
            Hands-on creative kits that turn screen time into imagination time.
            Proudly made for Sri Lankan families.
          </p>

          {/* Social links */}
          <div className="flex gap-[10px]">
            {SOCIAL.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/[0.08] text-[0.85rem] font-bold text-white/70 transition-colors duration-200 hover:bg-brand-sky hover:text-brand-indigo"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h4 className="mb-4 font-chewy text-[1rem] font-normal text-white">
              {col.heading}
            </h4>
            <ul className="space-y-[10px]">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[0.85rem] text-white/60 transition-colors duration-200 hover:text-brand-gold"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-5 flex items-center justify-between flex-wrap gap-3 text-[0.78rem] text-white/45 sm:px-8">
          <span>© {new Date().getFullYear()} KidPulse. All rights reserved.</span>
          <div className="flex gap-4">
            <span>🔒 Secure Checkout</span>
            <span>🚚 Islandwide Delivery</span>
          </div>
          <span>Designed & built by Lunor Labs (Pvt) Ltd</span>
        </div>
      </div>

    </footer>
  );
}