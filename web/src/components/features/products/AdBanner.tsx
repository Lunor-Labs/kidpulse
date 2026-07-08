import Link from 'next/link';
import adBanner from '@/config/adBanner';

export function AdBanner() {
  if (!adBanner.enabled) return null;

  return (
    <div
      className="overflow-hidden rounded-[18px] p-5"
      style={{ background: adBanner.gradient }}
    >
      {/* Decorative circle */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10"
      />

      <span className="mb-2 block text-[0.72rem] font-bold uppercase tracking-[0.08em] text-brand-gold">
        {adBanner.tag}
      </span>
      <h3 className="mb-1 font-chewy text-[1.15rem] text-white leading-tight">
        {adBanner.title}
      </h3>
      <p className="mb-4 text-[0.82rem] text-white/75 leading-relaxed">
        {adBanner.subtitle}
      </p>
      <Link
        href={adBanner.ctaHref}
        className="block w-full rounded-[10px] bg-brand-gold py-[10px] text-center text-[0.86rem] font-bold text-brand-indigo transition-colors hover:bg-brand-gold-deep"
      >
        {adBanner.ctaLabel}
      </Link>
    </div>
  );
}