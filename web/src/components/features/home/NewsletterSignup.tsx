'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("You're on the list! Check your inbox for your 10% code soon.");
    setEmail('');
  };

  return (
    <section className="bg-brand-indigo py-14">
      <div className="mx-auto max-w-xl px-4 text-center">
        <h3 className="font-display text-2xl font-bold text-white md:text-3xl">Get 10% off your first order</h3>
        <p className="mt-2 text-sm text-white/80">
          Join our newsletter for new kit drops, parenting tips, and exclusive discounts.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
          />
          <Button type="submit" variant="primary" className="shrink-0">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}
