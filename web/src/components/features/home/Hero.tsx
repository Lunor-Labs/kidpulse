import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-cream to-[#fff8ec]">

      {/* Background radial blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(56,182,255,0.18), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-100px] left-[8%] h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(237,63,127,0.12), transparent 70%)' }}
      />

      {/* ── Main two-column grid ── */}
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-8 md:grid-cols-2">

        {/* LEFT — Copy */}
        <div className="py-6">

          {/* Eyebrow pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-indigo/10 px-4 py-[7px] text-xs font-bold text-brand-indigo">
            <span
              aria-hidden
              className="animate-pulse-dot inline-block h-[7px] w-[7px] rounded-full bg-brand-berry"
            />
            New season kits just dropped
          </div>

          {/* Headline only */}
          <h1 className="font-display text-[clamp(2.3rem,4.4vw,3.6rem)] font-bold leading-[1.08] text-brand-indigo">
            Craft kits that turn{' '}
            <span className="text-brand-berry">screen<br />time</span>{' '}
            into{' '}
            <span className="text-brand-sky-deep">hands‑on</span>{' '}
            play.
          </h1>

        </div>

        {/* RIGHT — Art */}
        <div className="relative flex h-[440px] items-end justify-center">

          {/* Blob behind image */}
          <div
            aria-hidden
            className="absolute bottom-5 h-[340px] w-[340px] opacity-[0.16]"
            style={{
              borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
              background: 'linear-gradient(135deg, #38b6ff, #ed3f7f)',
            }}
          />

          {/* Hero product image */}
          <Image
            src="/images/hero-graphic.png"
            alt="KidPulse craft kit characters"
            width={420}
            height={420}
            priority
            className="relative z-10 h-[420px] w-auto drop-shadow-[0_18px_30px_rgba(27,11,128,0.18)]"
          />

          {/* Floating badge — top left */}
          <div className="animate-floaty absolute left-[-2%] top-[8%] z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-[10px] text-[0.82rem] font-bold text-brand-indigo shadow-[0_10px_24px_rgba(27,11,128,0.14)]">
            <span className="text-xl">🎨</span> New kit weekly
          </div>

          {/* Floating badge — bottom right */}
          <div className="animate-floaty-delayed absolute bottom-[14%] right-[-4%] z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-[10px] text-[0.82rem] font-bold text-brand-indigo shadow-[0_10px_24px_rgba(27,11,128,0.14)]">
            <span className="text-xl">⭐</span> 386 5-star reviews
          </div>
        </div>
      </div>

      {/* ── Carousel dots ── */}
      <div className="relative z-10 flex justify-center gap-2 pb-4">
        <span className="h-2 w-6 rounded-full bg-brand-indigo" />
        <span className="h-2 w-2 rounded-full bg-brand-indigo/20" />
        <span className="h-2 w-2 rounded-full bg-brand-indigo/20" />
      </div>

      {/* ── Shop Now button ── */}
      <div className="relative z-10 flex justify-center pb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-[14px] bg-brand-gold px-10 py-4 text-[1rem] font-bold text-brand-indigo transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          style={{ boxShadow: '0 6px 0 #e8af00' }}
        >
          🛍️ Shop Now
        </Link>
      </div>

    </section>
  );
}