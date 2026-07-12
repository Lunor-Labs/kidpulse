import { AccountCard } from '@/components/features/account/AccountCard';
import { WishlistGrid } from './WishlistGrid';

export const metadata = { title: 'Wishlist' };

export default function WishlistPage() {
  return (
    <AccountCard
      title="Your wishlist"
      subtitle="Save items you love and come back to them any time."
    >
      <WishlistGrid />
    </AccountCard>
  );
}
