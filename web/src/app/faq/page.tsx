import { InfoPageHero } from '@/components/features/info/InfoPageHero';
import { FaqAccordion, type FaqItem } from '@/components/features/info/FaqAccordion';

export const metadata = {
  title: 'FAQs',
  description: 'Answers to common questions about KidPulse kits, payments, delivery, and returns.',
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What age group are KidPulse kits suitable for?',
    answer:
      'Most of our kits are designed for children roughly 4 to 12 years old. Each product page lists a specific recommended age range — check there for the exact fit.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept PayHere (cards and bank apps), Cash on Delivery, and direct bank transfer at checkout.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'We deliver island-wide across Sri Lanka. See our Shipping Info page for estimated timeframes by area.',
  },
  {
    question: 'How do I track my order?',
    answer:
      "Use the Track Order page with your order number and email, or check your account's Orders section if you're signed in.",
  },
  {
    question: 'Can I return or exchange a kit?',
    answer:
      'Yes — see our Returns & Refunds page for the return window and conditions.',
  },
  {
    question: 'Are the materials safe for children?',
    answer:
      "Safety is a priority in every kit we design. We use child-safe, non-toxic materials, but always recommend adult supervision for younger kids, as noted on each product page.",
  },
];

export default function FaqPage() {
  return (
    <>
      <InfoPageHero
        title="Frequently Asked Questions"
        subtitle="Can't find what you're looking for? Reach out on our Contact page."
      />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </>
  );
}
