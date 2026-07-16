import { AccountCard } from '@/components/features/account/AccountCard';

export const metadata = { title: 'Saved cards' };

export default function CardsPage() {
  return (
    <AccountCard
      title="Saved cards"
      subtitle="Cards you save at checkout will appear here for one-click payments."
    >
      <div className="rounded-[14px] border border-dashed border-brand-line bg-brand-cream p-10 text-center">
        <div className="mb-3 text-4xl">💳</div>
        <h2 className="mb-1 font-chewy text-[1.2rem] text-brand-indigo">No saved cards</h2>
        <p className="text-[0.9rem] text-brand-ink-soft">
          You can save a card when you check out with PayHere.
        </p>
      </div>
    </AccountCard>
  );
}
