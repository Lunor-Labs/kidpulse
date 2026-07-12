import { AccountCard } from '@/components/features/account/AccountCard';
import { OrderDetailClient } from './OrderDetailClient';

export const metadata = { title: 'Order details' };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return (
    <AccountCard title={`Order ${orderNumber}`} subtitle="Full order details.">
      <OrderDetailClient orderNumber={orderNumber} />
    </AccountCard>
  );
}
