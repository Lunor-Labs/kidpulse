'use client';

import { Button } from '@/components/ui/Button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl" aria-hidden>🎨</p>
      <h1 className="font-display text-2xl font-bold text-brand-indigo">Something went wrong</h1>
      <p className="text-brand-ink-soft">Please try again in a moment.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
