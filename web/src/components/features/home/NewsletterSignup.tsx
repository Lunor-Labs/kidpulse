'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("You're on the list! Check your inbox for your 10% code soon.");
    setEmail('');
  };

  return (
    <div className="mx-auto max-w-7xl px-8 pb-[60px]">
      <div
        className="relative overflow-hidden rounded-[24px] flex items-center justify-between gap-8 px-12 py-11"
        style={{ background: 'linear-gradient(120deg, #ed3f7f, #ff6a9e)' }}
      >
        {/* Decorative white circle bottom-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-[220px] w-[220px] rounded-full bg-white/10"
        />

        {/* Text */}
        <div className="relative z-10">
          <h3 className="font-display text-[1.6rem] font-normal text-white mb-[6px]">
            Get 10% off your first order
          </h3>
          <p className="text-[0.9rem] text-white/85">
            Join our newsletter for new kit drops, parenting tips, and exclusive discounts.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex shrink-0 gap-[10px]"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            className="w-[240px] rounded-[12px] border-none bg-white px-[18px] py-[13px] text-[0.88rem] text-brand-ink outline-none placeholder:text-brand-ink-soft/60"
          />
          <button
            type="submit"
            className="rounded-[12px] bg-brand-indigo px-[22px] py-[13px] text-[0.88rem] font-bold text-white transition-colors duration-200 hover:bg-brand-indigo-deep whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}