import { AccountCard } from '@/components/features/account/AccountCard';
import { HomeBannerForm } from '@/components/features/admin/HomeBannerForm';

export const metadata = { title: 'New banner' };

export default function NewBannerPage() {
  return (
    <AccountCard title="New banner" subtitle="Add a hero slide to the homepage.">
      <HomeBannerForm />
    </AccountCard>
  );
}
