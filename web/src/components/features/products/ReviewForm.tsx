'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-brand-line bg-brand-cream p-4">
        <p className="text-[0.9rem] text-brand-ink">
          Bought this? Sign in to share your review.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(pathname || '/')}`}
          className="rounded-[10px] bg-brand-indigo px-4 py-2 text-[0.85rem] font-bold text-white hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Pick a rating from 1 to 5');
      return;
    }
    if (body.trim().length < 4) {
      toast.error('Add a short review');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post(
        `/api/v1/account/reviews/${productId}`,
        { rating, title: title.trim() || null, body: body.trim() },
        token
      );
      toast.success('Thanks for your review!');
      setTitle('');
      setBody('');
      setRating(0);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not submit review');
    } finally {
      setSaving(false);
    }
  }

  const display = hover || rating;

  return (
    <form onSubmit={submit} className="mb-8 rounded-[14px] border border-brand-line bg-white p-5">
      <h3 className="mb-3 font-chewy text-[1.15rem] text-brand-indigo">Write a review</h3>

      <div className="mb-3 flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={`text-[1.6rem] leading-none transition-colors ${
              n <= display ? 'text-brand-gold-deep' : 'text-brand-line'
            }`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-[0.82rem] text-brand-ink-soft">{rating} / 5</span>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="review-title" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
          Title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Short summary"
          className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="review-body" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
          Your review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Tell others what you liked about this product."
          required
          className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-[12px] bg-brand-indigo px-5 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90 disabled:opacity-60"
      >
        {saving ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
