import { CustomerDetailClient } from './DetailClient';

export const metadata = { title: 'Customer profile' };

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetailClient id={id} />;
}
