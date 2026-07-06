import Link from 'next/link';

export function AnnouncementBar() {
  return (
    <div className="hidden min-[601px]:flex items-center justify-between bg-brand-indigo-deep px-8 py-[7px] text-[0.78rem] text-white/75">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5">🚚 Free delivery on orders over Rs. 5,000</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/track-order" className="transition-colors hover:text-white">
          Track Order
        </Link>
        <Link href="/help" className="transition-colors hover:text-white">
          Help Center
        </Link>
        <Link href="#" className="transition-colors hover:text-white">
          🇱🇰 Sri Lanka
        </Link>
      </div>
    </div>
  );
}
