import { AccountCard } from '@/components/features/account/AccountCard';
import { CouponForm } from '@/components/features/admin/CouponForm';

export const metadata = { title: 'New coupon' };

export default function NewCouponPage() {
  return (
    <AccountCard title="New coupon" subtitle="Fixed or percentage discount redeemable at checkout.">
      <CouponForm />
    </AccountCard>
  );
}
