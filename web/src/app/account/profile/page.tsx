import { AccountCard } from '@/components/features/account/AccountCard';
import { ProfileForm } from './ProfileForm';

export const metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <AccountCard
      title="Your profile"
      subtitle="Edit your name and contact number. Email is managed via your login."
    >
      <ProfileForm />
    </AccountCard>
  );
}
