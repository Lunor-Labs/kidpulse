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

      <div
        key={active.id}
        className="animate-hero-fade relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2"
      >
        <div className="py-6">
          {active.eyebrow && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-indigo/10 px-4 py-[7px] text-xs font-bold text-brand-indigo">
              <span
                aria-hidden
                className="animate-pulse-dot inline-block h-[7px] w-[7px] rounded-full bg-brand-berry"
              />
              {active.eyebrow}
            </div>
          )}

          <h1 className="font-display text-[clamp(2.3rem,4.4vw,3.6rem)] font-bold leading-[1.08] text-brand-indigo">
            {active.headline}
          </h1>

          {active.subheadline && (
            <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-brand-ink-soft">
              {active.subheadline}
            </p>
          )}

          {active.ctaLabel && active.ctaHref && (
            <div className="mt-6">
              <Link
                href={active.ctaHref}
                className="inline-flex items-center gap-2 rounded-[14px] bg-brand-gold px-8 py-3 text-[0.95rem] font-bold text-brand-indigo transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                style={{ boxShadow: '0 6px 0 #e8af00' }}
              >
                {active.ctaLabel}
              </Link>
            </div>
          )}
        </div>

        <div className="relative flex h-[340px] items-end justify-center sm:h-[440px]">
          <div
            aria-hidden
            className="absolute bottom-5 h-[340px] w-[340px] opacity-[0.16]"
            style={{
              borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
              background: 'linear-gradient(135deg, #38b6ff, #ed3f7f)',
            }}
          />
          <Image
            src={active.imageUrl}
            alt={active.headline}
            width={520}
            height={520}
            priority
            className="relative z-10 h-[300px] w-auto max-w-full object-contain drop-shadow-[0_18px_30px_rgba(27,11,128,0.18)] sm:h-[420px]"
          />
        </div>
      </div>

      {banners.length > 1 && (
        <div className="relative z-10 flex justify-center gap-2 pb-6">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx ? 'w-6 bg-brand-indigo' : 'w-2 bg-brand-indigo/20 hover:bg-brand-indigo/40'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
