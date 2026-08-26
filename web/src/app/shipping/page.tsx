import Link from 'next/link';
import { InfoPageHero } from '@/components/features/info/InfoPageHero';

export const metadata = {
  title: 'Shipping Info',
  description: 'Delivery timeframes, costs, and coverage for KidPulse orders across Sri Lanka.',
};

export default function ShippingPage() {
  return (
    <>
      <InfoPageHero title="Shipping Information" subtitle="Island-wide delivery across Sri Lanka." />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="space-y-8 text-[0.95rem] leading-relaxed text-brand-ink">
          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">Processing time</h2>
            <p>
              Orders are packed and handed to our courier partner within 1–2 business days of
              payment confirmation.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">Delivery timeframes</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Colombo &amp; suburbs: 2–4 business days</li>
              <li>Rest of the island: 4–7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">Shipping cost</h2>
            <p>Delivery cost is calculated at checkout based on your address.</p>
          </section>

          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">Cash on Delivery</h2>
            <p>
              Prefer to pay when it arrives? Choose Cash on Delivery at checkout alongside our
              card and bank transfer options.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">Tracking your order</h2>
            <p>
              Once your order ships, you can check its status any time on our{' '}
              <Link href="/track-order" className="font-semibold text-brand-indigo hover:underline">
                Track Order
              </Link>{' '}
              page.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
