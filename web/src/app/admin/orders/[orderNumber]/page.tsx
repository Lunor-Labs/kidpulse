import { OrderDetailClient } from './OrderDetailClient';

export const metadata = { title: 'Order' };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <OrderDetailClient orderNumber={orderNumber} />;
}
