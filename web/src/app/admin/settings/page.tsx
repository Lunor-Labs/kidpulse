import { AccountCard } from '@/components/features/account/AccountCard';
import { AdminSettingsForm } from '@/components/features/admin/AdminSettingsForm';

export const metadata = { title: 'Settings' };

export default function AdminSettingsPage() {
  return (
    <AccountCard
      title="Store settings"
      subtitle="Bank transfer details, WhatsApp number, and support contact used across the storefront."
    >
      <AdminSettingsForm />
    </AccountCard>
  );
}
