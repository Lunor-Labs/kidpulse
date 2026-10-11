import Link from 'next/link';
import { InfoPageHero } from '@/components/features/info/InfoPageHero';
import { TrackOrderForm } from '@/components/features/info/TrackOrderForm';

export const metadata = {
  title: 'Track Your Order',
  description: 'Check the status of a KidPulse order using your order number and email.',
};

export default function TrackOrderPage() {
  return (
    <>
      <InfoPageHero
        title="Track Your Order"
        subtitle="Enter your order number and email to check its status."
      />

      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <p className="mb-6 text-center text-[0.9rem] text-brand-ink-soft">
          Already signed in?{' '}
          <Link href="/account/orders" className="font-semibold text-brand-indigo hover:underline">
            View your orders
          </Link>{' '}
          from your account instead.
        </p>
        <TrackOrderForm />
      </div>
    </>
  );
}
