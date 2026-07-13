import { FailedClient } from './FailedClient';

export const metadata = { title: 'Payment failed' };

export default async function FailedPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <FailedClient orderNumber={orderNumber} />;
}
