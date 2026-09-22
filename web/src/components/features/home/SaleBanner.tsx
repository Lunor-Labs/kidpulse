import Link from 'next/link';
import { getGlobalProductBanner } from '@/lib/api';

export async function SaleBanner() {
  let banner;
  try {
    banner = await getGlobalProductBanner();
  } catch {
    banner = null;
  }

  if (!banner) return null;

  const background = banner.gradient ?? 'linear-gradient(120deg, #1b0b80, #2c1aa0)';

  return (
    <div className="mx-auto max-w-7xl px-5 mb-[60px] sm:px-8">
      <div
        className="relative overflow-hidden rounded-[24px] flex flex-col items-start gap-5 px-6 py-8 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-10 sm:py-9"
        style={{ background }}
      >
        {/* Decorative gold circle top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-[220px] w-[220px] rounded-full"
          style={{ background: 'rgba(255,195,0,0.14)' }}
        />

        {/* Text */}
        <div className="relative z-10">
          {banner.eyebrow && (
            <span className="mb-2 block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-brand-gold">
              {banner.eyebrow}
            </span>
          )}
          <h3 className="font-chewy text-[1.7rem] font-normal text-white mb-[6px]">
            {banner.headline}
          </h3>
          {banner.subheadline && (
            <p className="text-[0.92rem] text-white/75">
              {banner.subheadline}
            </p>
          )}
        </div>

        {/* CTA */}
        {banner.ctaLabel && banner.ctaHref && (
          <Link
            href={banner.ctaHref}
            className="relative z-10 flex shrink-0 items-center gap-2 rounded-[14px] bg-brand-gold px-[26px] py-[13px] text-[0.92rem] font-bold text-brand-indigo transition-colors duration-200 hover:bg-white"
          >
            {banner.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}