import { SuccessClient } from './SuccessClient';

export const metadata = {
  title: 'Order confirmed — KidPulse',
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ newAccount?: string }>;
}) {
  const { orderNumber } = await params;
  const { newAccount } = await searchParams;
  return (
    <SuccessClient
      orderNumber={orderNumber}
      createdAccount={newAccount === '1'}
    />
  );
}
