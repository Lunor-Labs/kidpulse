import { InfoPageHero } from '@/components/features/info/InfoPageHero';
import { ContactForm } from '@/components/features/info/ContactForm';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with the KidPulse team about an order, a kit, or anything else.',
};

export default function ContactPage() {
  return (
    <>
      <InfoPageHero
        title="Contact Us"
        subtitle="Questions about an order or a kit? We're happy to help."
      />

      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <p className="mb-6 text-center text-[0.9rem] text-brand-ink-soft">
          Email us directly at{' '}
          <a href="mailto:hello@kidpulse.lk" className="font-semibold text-brand-indigo hover:underline">
            hello@kidpulse.lk
          </a>{' '}
          — we usually reply within 1 business day. Or use the form below.
        </p>
        <ContactForm />
      </div>
    </>
  );
}
