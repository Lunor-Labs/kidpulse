import { InfoPageHero } from '@/components/features/info/InfoPageHero';

export const metadata = {
  title: 'Careers',
  description: 'Careers at KidPulse — current openings and how to reach out.',
};

export default function CareersPage() {
  return (
    <>
      <InfoPageHero
        title="Careers at KidPulse"
        subtitle="We're not hiring right now, but we'd still love to hear from you."
      />

      <div className="mx-auto max-w-2xl px-5 py-12 text-center sm:px-8">
        <p className="text-[0.95rem] leading-relaxed text-brand-ink">
          We don&rsquo;t have any open positions at the moment. If you&rsquo;d like to be
          considered for future roles at KidPulse, feel free to send us your CV and a short note
          about what you&rsquo;re interested in at{' '}
          <a href="mailto:hello@kidpulse.lk" className="font-semibold text-brand-indigo hover:underline">
            hello@kidpulse.lk
          </a>{' '}
          — mention &ldquo;Careers&rdquo; in the subject line.
        </p>
      </div>
    </>
  );
}
