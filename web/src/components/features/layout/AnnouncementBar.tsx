import Link from 'next/link';

export function AnnouncementBar() {
  return (
    <div className="bg-brand-indigo px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-6">
        <span>🚚 Free delivery on orders over Rs. 5,000</span>
        <span className="hidden items-center gap-4 sm:flex">
          <Link href="/track-order" className="hover:text-brand-gold">Track Order</Link>
          <Link href="/help" className="hover:text-brand-gold">Help Center</Link>
        </span>
      </div>
    </div>
  );
}
