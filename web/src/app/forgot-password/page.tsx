import Link from 'next/link';
import { AuthShell } from '@/components/features/auth/AuthShell';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata = {
  title: 'Reset your password',
  description: 'Request a password reset for your KidPulse account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter the email you signed up with and we&rsquo;ll send you a reset link."
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-bold text-brand-indigo hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
