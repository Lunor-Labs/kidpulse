import { InfoPageHero } from '@/components/features/info/InfoPageHero';

export const metadata = {
  title: 'About Us',
  description: 'KidPulse makes DIY painting and STEM kits that turn screen time into hands-on play, made for Sri Lankan families.',
};

const VALUES = [
  {
    emoji: '🎨',
    title: 'Made to create',
    body: 'Every kit is designed around a real hands-on project — a character to paint, an experiment to run — not just a toy to unbox.',
  },
  {
    emoji: '🛡️',
    title: 'Safe by design',
    body: 'We choose child-safe materials and age-appropriate activities, so parents can hand over a kit without worry.',
  },
  {
    emoji: '🚚',
    title: 'Island-wide delivery',
    body: "Wherever you are in Sri Lanka, we'll get a kit to your door — with cash on delivery available too.",
  },
];

export default function AboutPage() {
  return (
    <>
      <InfoPageHero
        title="About KidPulse"
        subtitle="Turning screen time into imagination time, one kit at a time."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="space-y-4 text-[0.95rem] leading-relaxed text-brand-ink">
          <p>
            KidPulse started with a simple idea: kids don&rsquo;t need another app, they need
            something to build, paint, and be proud of. We put together DIY character painting
            kits and STEM kits that give children a screen-free project to get lost in — and
            parents a break they can feel good about.
          </p>
          <p>
            We&rsquo;re a small team based in Sri Lanka, building kits for Sri Lankan families.
            From picking materials that are safe for small hands to packing every order that
            leaves our warehouse, we try to make sure a KidPulse box feels like a little event
            when it arrives.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-[16px] border border-brand-line bg-brand-cream p-5 text-center"
            >
              <div className="mb-2 text-[1.75rem]">{value.emoji}</div>
              <h3 className="mb-1 font-chewy text-[1.05rem] text-brand-indigo">{value.title}</h3>
              <p className="text-[0.85rem] leading-relaxed text-brand-ink-soft">{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
