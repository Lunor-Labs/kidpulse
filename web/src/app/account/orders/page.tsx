import { AccountCard } from '@/components/features/account/AccountCard';
import { OrdersListClient } from './OrdersListClient';

export const metadata = { title: 'My orders' };

export default function OrdersPage() {
  return (
    <AccountCard
      title="My orders"
      subtitle="Track and re-order items you've bought from KidPulse."
    >
      <OrdersListClient />
    </AccountCard>
  );
}
