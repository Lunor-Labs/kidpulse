import { BankTransferClient } from './BankTransferClient';

export const metadata = { title: 'Bank transfer instructions' };

export default async function BankTransferPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <BankTransferClient orderNumber={orderNumber} />;
}
