import Link from 'next/link';
import { InfoPageHero } from '@/components/features/info/InfoPageHero';
import { FaqAccordion, type FaqItem } from '@/components/features/info/FaqAccordion';

export const metadata = {
  title: 'Help Center — KidPulse',
  description:
    'Get help with your KidPulse order, account, payments, delivery, and returns.',
};

const SECTIONS: { heading: string; emoji: string; items: FaqItem[] }[] = [
  {
    heading: 'Orders & Checkout',
    emoji: '🛒',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Browse our products, add items to your cart, and proceed to checkout. You can check out as a guest — we will automatically create an account for you using your email so you can track your order.',
      },
      {
        question: 'Can I change or cancel my order after placing it?',
        answer:
          'Orders can be cancelled while they are still in Pending or Pending Payment status. Once processing has started, please contact us immediately at hello@kidpulse.lk and we will do our best to help.',
      },
      {
        question: 'What is the minimum order value?',
        answer:
          'There is no minimum order value. Shipping is calculated at checkout based on your location and order total.',
      },
      {
        question: 'Can I add a gift note to my order?',
        answer:
          'Yes — there is an optional "Order notes" field at checkout where you can include a personalised gift message or any special instructions.',
      },
    ],
  },
  {
    heading: 'Payments',
    emoji: '💳',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept PayHere (Visa, Mastercard, and online banking), Cash on Delivery (COD), and direct bank transfer. All options are available at checkout.',
      },
      {
        question: 'Is it safe to pay online on KidPulse?',
        answer:
          'Yes. All card payments are processed securely through PayHere — your card details never touch our servers. The site runs on HTTPS and all passwords are encrypted.',
      },
      {
        question: 'How does bank transfer work?',
        answer:
          'Choose "Bank Transfer" at checkout to place your order. You will then see our bank account details on screen and receive them by email. Transfer the amount within the deadline shown, then send your deposit slip to our WhatsApp number. We will confirm payment and move your order to Processing.',
      },
      {
        question: 'My card payment failed. What should I do?',
        answer:
          'Your cart is preserved — go to My Orders, open the order, and click "Retry payment". You have up to 3 attempts. If all attempts fail, please contact us and we will help you complete the purchase manually.',
      },
      {
        question: 'Will I get a receipt?',
        answer:
          'Yes. A confirmation email is sent automatically after every successful order. You can also download an invoice PDF from the order detail page in your account.',
      },
    ],
  },
  {
    heading: 'Delivery & Shipping',
    emoji: '🚚',
    items: [
      {
        question: 'Do you deliver island-wide?',
        answer:
          'Yes, we deliver to all districts across Sri Lanka. See our Shipping Info page for estimated delivery times and any area-specific notes.',
      },
      {
        question: 'How much does shipping cost?',
        answer:
          'Shipping costs are calculated at checkout. Orders above a certain value qualify for free shipping — the exact threshold is shown at checkout and in your cart.',
      },
      {
        question: 'How do I track my order?',
        answer:
          'You can track your order from the Orders page in your account. We also send an email every time your order status changes — from Processing to Shipped to Delivered.',
      },
      {
        question: 'Can I ship to multiple addresses?',
        answer:
          'Each order ships to one address. If you need items sent to different locations, please place separate orders.',
      },
    ],
  },
  {
    heading: 'Returns & Refunds',
    emoji: '↩️',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'Please see our Returns & Refunds page for the full policy including the return window, eligible conditions, and how to initiate a return.',
      },
      {
        question: 'My order arrived damaged. What do I do?',
        answer:
          'We are sorry to hear that. Please contact us within 48 hours of delivery at hello@kidpulse.lk with a photo of the damaged item and your order number. We will arrange a replacement or refund promptly.',
      },
      {
        question: 'How long do refunds take?',
        answer:
          'Once your return is received and approved, refunds are processed within 5–7 business days to your original payment method.',
      },
    ],
  },
  {
    heading: 'Account & Profile',
    emoji: '👤',
    items: [
      {
        question: 'Do I need an account to order?',
        answer:
          'No — you can check out as a guest. However, an account is automatically created with your email so you can track your order and access your order history at any time.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot password" on the login page and enter your email. We will send a reset link valid for 1 hour. Check your spam folder if you do not see it within a few minutes.',
      },
      {
        question: 'Can I change my email address?',
        answer:
          'For security reasons, your email address cannot be changed after registration. If you need help, contact us at hello@kidpulse.lk.',
      },
      {
        question: 'How do I save a delivery address?',
        answer:
          'Go to My Account → Addresses to add, edit, or set a default delivery address. Saved addresses appear as a quick-select option at checkout.',
      },
    ],
  },
  {
    heading: 'Products & Safety',
    emoji: '🎨',
    items: [
      {
        question: 'What age groups are KidPulse kits suitable for?',
        answer:
          'Most kits are designed for children aged 4 to 12. Each product page shows a specific recommended age range — always check there before ordering.',
      },
      {
        question: 'Are the materials safe?',
        answer:
          'Yes. All KidPulse kits use child-safe, non-toxic materials. Adult supervision is recommended for younger children, as noted on each product page.',
      },
      {
        question: 'A product I want is out of stock. Will it come back?',
        answer:
          'We restock popular items regularly. Add the product to your wishlist — you will see it again as soon as it is available.',
      },
    ],
  },
];

const QUICK_LINKS = [
  { label: 'Track my order', href: '/track-order' },
  { label: 'Shipping info', href: '/shipping' },
  { label: 'Returns & refunds', href: '/returns' },
  { label: 'Contact us', href: '/contact' },
  { label: 'FAQs', href: '/faq' },
];

export default function HelpPage() {
  return (
    <>
      <InfoPageHero
        title="Help Center"
        subtitle="Find answers about orders, payments, delivery, returns, and your account."
      />

      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        {/* Quick links */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-brand-line bg-white px-4 py-2 text-[0.85rem] font-semibold text-brand-ink transition-colors hover:border-brand-indigo hover:text-brand-indigo"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* FAQ sections */}
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="mb-4 flex items-center gap-2 font-chewy text-[1.3rem] text-brand-indigo">
                <span>{section.emoji}</span>
                <span>{section.heading}</span>
              </h2>
              <FaqAccordion items={section.items} />
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-12 rounded-[16px] border border-brand-line bg-brand-cream p-8 text-center">
          <p className="mb-1 font-chewy text-[1.3rem] text-brand-indigo">
            Still need help?
          </p>
          <p className="mb-5 text-[0.9rem] text-brand-ink-soft">
            Our team usually replies within one business day.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-brand-indigo px-5 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90"
            >
              Contact us
            </Link>
            
            <Link
              href="mailto:hello@kidpulse.lk"
              className="rounded-full border border-brand-line bg-white px-5 py-2.5 text-[0.9rem] font-semibold text-brand-ink hover:bg-white/60"
            >
              hello@kidpulse.lk
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}