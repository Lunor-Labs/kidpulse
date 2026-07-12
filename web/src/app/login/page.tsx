import { Suspense } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/features/auth/AuthShell';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your KidPulse account.',
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders and access your wishlist."
      footer={
        <>
          Don&rsquo;t have an account?{' '}
          <Link href="/register" className="font-bold text-brand-indigo hover:underline">
            Register
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-[240px]" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
