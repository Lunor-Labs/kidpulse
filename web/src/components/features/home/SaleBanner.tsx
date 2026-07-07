import Link from 'next/link';

export function SaleBanner() {
  return (
    <div className="mx-auto max-w-7xl px-8 mb-[60px]">
      <div
        className="relative overflow-hidden rounded-[24px] flex items-center justify-between px-10 py-9 gap-4"
        style={{
          background: 'linear-gradient(120deg, #1b0b80, #2c1aa0)',
        }}
      >
        {/* Decorative gold circle top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-[220px] w-[220px] rounded-full"
          style={{ background: 'rgba(255,195,0,0.14)' }}
        />

        {/* Text */}
        <div className="relative z-10">
          <span className="mb-2 block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-brand-gold">
            Limited time
          </span>
          <h3 className="font-display text-[1.7rem] font-normal text-white mb-[6px]">
            Character Painting Kits — up to 82% off
          </h3>
          <p className="text-[0.92rem] text-white/75">
            Our most-loved kit ever. Pick your characters, paint together, treasure forever.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/products?category=painting-kits"
          className="relative z-10 flex shrink-0 items-center gap-2 rounded-[14px] bg-brand-gold px-[26px] py-[13px] text-[0.92rem] font-bold text-brand-indigo transition-colors duration-200 hover:bg-white"
        >
          Shop the sale →
        </Link>
      </div>
    </div>
  );
}