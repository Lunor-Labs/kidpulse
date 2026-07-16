import { Suspense } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/features/auth/AuthShell';
import { RegisterForm } from './RegisterForm';

export const metadata = {
  title: 'Create account',
  description: 'Create a KidPulse account to save your favourites and track orders.',
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join KidPulse to save favourites and track orders."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand-indigo hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-[300px]" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
