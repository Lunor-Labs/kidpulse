import { AccountCard } from '@/components/features/account/AccountCard';
import { AddressesManager } from './AddressesManager';

export const metadata = { title: 'Addresses' };

export default function AddressesPage() {
  return (
    <AccountCard
      title="Delivery addresses"
      subtitle="Save the addresses you use most so checkout is faster."
    >
      <AddressesManager />
    </AccountCard>
  );
}
