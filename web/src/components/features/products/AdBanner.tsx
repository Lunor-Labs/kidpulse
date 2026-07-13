import Image from 'next/image';
import Link from 'next/link';
import adBanner from '@/config/adBanner';
import type { ProductBanner } from '@/types/catalog';

interface AdBannerProps {
  banner?: ProductBanner | null;
}

export function AdBanner({ banner }: AdBannerProps) {
  if (banner) {
    return <DynamicBanner banner={banner} />;
  }
  if (!adBanner.enabled) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[18px] p-5"
      style={{ background: adBanner.gradient }}
    >
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

function DynamicBanner({ banner }: { banner: ProductBanner }) {
  const gradient =
    banner.gradient?.trim() || 'linear-gradient(135deg, #1b0b80, #2c1aa0)';
  return (
    <div
      className="relative overflow-hidden rounded-[18px] p-5"
      style={{ background: gradient }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10"
      />
      {banner.imageUrl && (
        <div className="relative mb-3 h-24 w-full overflow-hidden rounded-[12px]">
          <Image
            src={banner.imageUrl}
            alt={banner.headline}
            fill
            sizes="220px"
            className="object-cover"
          />
        </div>
      )}
      {banner.eyebrow && (
        <span className="mb-2 block text-[0.72rem] font-bold uppercase tracking-[0.08em] text-brand-gold">
          {banner.eyebrow}
        </span>
      )}
      <h3 className="mb-1 font-chewy text-[1.15rem] text-white leading-tight">
        {banner.headline}
      </h3>
      {banner.subheadline && (
        <p className="mb-4 text-[0.82rem] text-white/75 leading-relaxed">
          {banner.subheadline}
        </p>
      )}
      {banner.ctaHref && banner.ctaLabel && (
        <Link
          href={banner.ctaHref}
          className="block w-full rounded-[10px] bg-brand-gold py-[10px] text-center text-[0.86rem] font-bold text-brand-indigo transition-colors hover:bg-brand-gold-deep"
        >
          {banner.ctaLabel}
        </Link>
      )}
    </div>
  );
}
