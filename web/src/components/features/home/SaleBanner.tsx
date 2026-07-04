import Link from 'next/link';

export function SaleBanner() {
  return (
    <section className="bg-brand-berry">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="font-display text-xl font-bold text-white md:text-2xl">
            Character Painting Kits — up to 80% off
          </h3>
          <p className="text-sm text-white/85">Limited stock. Island-wide delivery.</p>
        </div>
        <Link
          href="/products?category=painting-kits"
          className="rounded-full bg-brand-gold px-6 py-2.5 font-semibold text-brand-ink transition-colors hover:bg-brand-gold-deep"
        >
          Shop the sale →
        </Link>
      </div>
    </section>
  );
}
