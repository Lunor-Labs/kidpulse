import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';

const MOMENTS = [1, 2, 3, 4, 5, 6].map((n) => ({
  src: `/images/moments/${n}.jpg`,
  alt: `Kids enjoying KidPulse craft kits — photo ${n}`,
}));

export function MomentsGallery() {
  return (
    <section className="bg-brand-cream/50 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title="Shared Moments with KidPulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MOMENTS.map((m) => (
            <div key={m.src} className="relative aspect-square overflow-hidden rounded-2xl">
              <Image src={m.src} alt={m.alt} fill sizes="(max-width: 640px) 50vw, 17vw" className="object-cover transition-transform duration-300 hover:scale-105" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm font-semibold text-brand-ink-soft">5,000+ happy parents 💛</p>
      </div>
    </section>
  );
}
