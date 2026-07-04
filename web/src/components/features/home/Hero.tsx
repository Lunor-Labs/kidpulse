import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-cream to-brand-paper">
      <div aria-hidden className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-brand-sky/20 blur-2xl" />
      <div aria-hidden className="absolute -right-8 bottom-8 h-40 w-40 rounded-full bg-brand-berry/15 blur-2xl" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-brand-indigo md:text-5xl">
            Craft kits that turn <span className="text-brand-berry">screen time</span> into hands-on play.
          </h1>
          <p className="mt-4 max-w-md text-brand-ink-soft">
            DIY character painting kits and STEM kits, delivered island-wide. Child-safe materials, endless proud moments.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-brand-berry px-8 py-3 font-display text-lg font-semibold text-white transition-colors hover:bg-brand-berry-deep"
            >
              🛍️ Shop Now
            </Link>
            <div className="text-sm text-brand-ink-soft">
              <p>🎨 New kit weekly</p>
              <p>⭐ 4.9 average rating</p>
            </div>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <Image
            src="/images/hero-graphic.png"
            alt="KidPulse craft kit characters"
            width={520}
            height={520}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
