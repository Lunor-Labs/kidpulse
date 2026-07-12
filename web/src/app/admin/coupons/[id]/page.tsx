import { EditCouponClient } from './EditClient';

export const metadata = { title: 'Edit coupon' };

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCouponClient id={id} />;
}
