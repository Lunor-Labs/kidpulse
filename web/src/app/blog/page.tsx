import Link from 'next/link';
import { InfoPageHero } from '@/components/features/info/InfoPageHero';

export const metadata = {
  title: 'Blog',
  description: 'Craft ideas, parenting tips, and stories from KidPulse — coming soon.',
};

export default function BlogPage() {
  return (
    <>
      <InfoPageHero
        title="KidPulse Blog"
        subtitle="Craft ideas, parenting tips, and behind-the-scenes stories — coming soon."
      />

      <div className="mx-auto max-w-2xl px-5 py-12 text-center sm:px-8">
        <p className="mb-6 text-[0.95rem] leading-relaxed text-brand-ink">
          We&rsquo;re working on our first posts. Check back soon, or browse our kits in the
          meantime.
        </p>
        <Link
          href="/products"
          className="inline-block rounded-full bg-brand-berry px-6 py-2.5 text-[0.9rem] font-bold text-white hover:bg-brand-berry-deep"
        >
          Browse products
        </Link>
      </div>
    </>
  );
}
