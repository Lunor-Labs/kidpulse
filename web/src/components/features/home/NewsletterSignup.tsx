'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BannerConfig {
  heading: string;
  subtext: string;
}

const DEFAULTS: BannerConfig = {
  heading: 'Get 10% off your first order',
  subtext: 'Join our newsletter for new kit drops, parenting tips, and exclusive discounts.',
};

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<BannerConfig>(DEFAULTS);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/settings`)
      .then((r) => r.json())
      .then((res) => {
        const s = res?.data;
        if (!s) return;
        const pct = s.newsletterDiscountPct;
        setConfig({
          heading:
            s.newsletterHeading ||
            (pct ? `Get ${pct}% off your first order` : DEFAULTS.heading),
          subtext: s.newsletterSubtext || DEFAULTS.subtext,
        });
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newsletter/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) throw new Error();
      toast.success("You're on the list! Check your inbox soon.");
      setEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-[60px] sm:px-8">
      <div
        className="relative overflow-hidden rounded-[24px] flex flex-col items-start gap-6 px-6 py-9 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-12 sm:py-11"
        style={{ background: 'linear-gradient(120deg, #ed3f7f, #ff6a9e)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-[220px] w-[220px] rounded-full bg-white/10"
        />
        <div className="relative z-10">
          <h3 className="font-chewy text-[1.6rem] font-normal text-white mb-[6px]">
            {config.heading}
          </h3>
          <p className="text-[0.9rem] text-white/85">{config.subtext}</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex w-full flex-col gap-[10px] sm:w-auto sm:shrink-0 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            disabled={loading}
            className="w-full rounded-[12px] border-none bg-white px-[18px] py-[13px] text-[0.88rem] text-brand-ink outline-none placeholder:text-brand-ink-soft/60 sm:w-[240px] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-[12px] bg-brand-indigo px-[22px] py-[13px] text-[0.88rem] font-bold text-white transition-colors duration-200 hover:bg-brand-indigo-deep whitespace-nowrap disabled:opacity-60"
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
}