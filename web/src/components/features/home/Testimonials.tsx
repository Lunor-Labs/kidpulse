import { SectionHeading } from '@/components/ui/SectionHeading';

const TESTIMONIALS = [
  { quote: "My daughter spent hours painting instead of watching cartoons. The quality is amazing and she's so proud of what she made!", name: 'Nadeesha', city: 'Colombo' },
  { quote: 'The perfect birthday return gift. All the other parents asked where I got them — ordered another batch the next week!', name: 'Tharindu', city: 'Kandy' },
  { quote: 'Excellent quality and so easy to use. My 5-year-old finished it almost on his own. Genuinely educational and fun.', name: 'Dilushi', city: 'Galle' },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="What Parents Say" />
      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="rounded-2xl border border-brand-line bg-white p-6">
            <p aria-label="5 out of 5 stars" className="text-brand-gold">★★★★★</p>
            <blockquote className="mt-3 text-sm text-brand-ink">{t.quote}</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky font-bold text-white">
                {t.name[0]}
              </span>
              <span>
                <span className="block text-sm font-semibold text-brand-ink">{t.name}</span>
                <span className="block text-xs text-brand-ink-soft">{t.city}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
