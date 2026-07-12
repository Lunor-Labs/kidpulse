import { AuthShell } from '@/components/features/auth/AuthShell';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata = {
  title: 'Set a new password',
  description: 'Choose a new password for your KidPulse account.',
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Pick something strong you can remember."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
