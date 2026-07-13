import { AccountCard } from '@/components/features/account/AccountCard';
import { ProductBannerForm } from '@/components/features/admin/ProductBannerForm';

export const metadata = { title: 'New product banner' };

export default function NewProductBannerPage() {
  return (
    <AccountCard
      title="New product banner"
      subtitle="Promote an offer on your product detail pages."
    >
      <ProductBannerForm />
    </AccountCard>
  );
}
