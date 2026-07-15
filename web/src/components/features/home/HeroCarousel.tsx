'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { HomeBanner } from '@/types/catalog';

const AUTO_ROTATE_MS = 6000;

export function HeroCarousel({ banners }: { banners: HomeBanner[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [banners.length]);

  const active = banners[idx] ?? banners[0];
  if (!active) return null;

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
      <div
        key={active.id}
        className="animate-hero-fade relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2"
      >
        {/* LEFT — Copy */}
        <div className="py-6">

          {/* Eyebrow pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-indigo/10 px-4 py-[7px] text-xs font-bold text-brand-indigo">
            <span
              aria-hidden
              className="animate-pulse-dot inline-block h-[7px] w-[7px] rounded-full bg-brand-berry"
            />
            {active.eyebrow ?? 'New season kits just dropped'}
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(2.3rem,4.4vw,3.6rem)] font-bold leading-[1.08] text-brand-indigo">
            {active.headline}
          </h1>

          {/* Subheadline */}
          {active.subheadline && (
            <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-brand-ink-soft">
              {active.subheadline}
            </p>
          )}
        </div>

        {/* RIGHT — Art */}
        <div className="relative flex h-[340px] items-end justify-center sm:h-[440px]">

          {/* Blob behind image */}
          <div
            aria-hidden
            className="absolute bottom-5 h-[340px] w-[340px] opacity-[0.16]"
            style={{
              borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
              background: 'linear-gradient(135deg, #38b6ff, #ed3f7f)',
            }}
          />

          {/* Banner image */}
          <Image
            src={active.imageUrl}
            alt={active.headline}
            width={420}
            height={420}
            priority
            className="relative z-10 h-[300px] w-auto max-w-full object-contain drop-shadow-[0_18px_30px_rgba(27,11,128,0.18)] sm:h-[420px]"
          />

          {/* Floating badge — top left */}
          <div className="animate-floaty absolute left-1 top-[8%] z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-[10px] text-[0.82rem] font-bold text-brand-indigo shadow-[0_10px_24px_rgba(27,11,128,0.14)] sm:left-[-2%]">
            <span className="text-xl">🎨</span> New kit weekly
          </div>

          {/* Floating badge — bottom right */}
          <div className="animate-floaty-delayed absolute bottom-[14%] right-1 z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-[10px] text-[0.82rem] font-bold text-brand-indigo shadow-[0_10px_24px_rgba(27,11,128,0.14)] sm:right-[-4%]">
            <span className="text-xl">⭐</span> 386 5-star reviews
          </div>
        </div>
      </div>

      {/* ── Carousel dots ── */}
      <div className="relative z-10 flex justify-center gap-2 pb-4">
        {banners.length > 1 ? (
          banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx
                  ? 'w-6 bg-brand-indigo'
                  : 'w-2 bg-brand-indigo/20 hover:bg-brand-indigo/40'
              }`}
            />
          ))
        ) : (
          <>
            <span className="h-2 w-6 rounded-full bg-brand-indigo" />
            <span className="h-2 w-2 rounded-full bg-brand-indigo/20" />
            <span className="h-2 w-2 rounded-full bg-brand-indigo/20" />
          </>
        )}
      </div>

      {/* ── Shop Now / CTA button ── */}
      <div className="relative z-10 flex justify-center pb-8">
        <Link
          href={active.ctaHref ?? '/products'}
          className="inline-flex items-center gap-2 rounded-[14px] bg-brand-gold px-10 py-4 text-[1rem] font-bold text-brand-indigo transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          style={{ boxShadow: '0 6px 0 #e8af00' }}
        >
          {active.ctaLabel ?? '🛍️ Shop Now'}
        </Link>
      </div>

    </section>
  );
}
