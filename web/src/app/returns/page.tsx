import Link from 'next/link';
import { InfoPageHero } from '@/components/features/info/InfoPageHero';

export const metadata = {
  title: 'Returns & Refunds',
  description: "KidPulse's return window, conditions, and how to start a return.",
};

export default function ReturnsPage() {
  return (
    <>
      <InfoPageHero
        title="Returns & Refunds"
        subtitle="Not quite right? Here's how returns work."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="space-y-8 text-[0.95rem] leading-relaxed text-brand-ink">
          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">Return window</h2>
            <p>
              You can request a return within 7 days of delivery. To be eligible, the kit must be
              unused, unopened, and in its original packaging.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">
              What can&rsquo;t be returned
            </h2>
            <p>
              For hygiene and safety reasons, kits that have been opened or used cannot be
              returned unless the item arrived damaged or faulty.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">How to start a return</h2>
            <p>
              Contact us on our{' '}
              <Link href="/contact" className="font-semibold text-brand-indigo hover:underline">
                Contact page
              </Link>{' '}
              with your order number and reason for the return, and we&rsquo;ll walk you through
              the next steps.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-chewy text-[1.15rem] text-brand-indigo">Refunds</h2>
            <p>
              Once we receive and inspect the returned item, refunds are processed to your
              original payment method within 5–7 business days.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
