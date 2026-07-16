import type { Review } from '@/types/catalog';
import { ReviewForm } from './ReviewForm';

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span aria-label={`${rating} out of 5 stars`} className="tracking-[1px] text-brand-gold-deep">
      {'★'.repeat(rounded)}
      <span className="text-brand-line">{'★'.repeat(Math.max(0, 5 - rounded))}</span>
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface ProductReviewsProps {
  productId: string;
  avgRating: number;
  reviewCount: number;
  reviews: Review[];
}

export function ProductReviews({ productId, avgRating, reviewCount, reviews }: ProductReviewsProps) {
  return (
    <section className="mt-14 border-t border-brand-line pt-10">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 className="font-chewy text-[1.6rem] text-brand-indigo">Reviews</h2>
        {reviewCount > 0 && (
          <span className="text-[0.9rem] text-brand-ink-soft">
            {avgRating.toFixed(1)} · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <ReviewForm productId={productId} />

      {reviewCount === 0 ? (
        <p className="text-[0.92rem] text-brand-ink-soft">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-[14px] border border-brand-line bg-white p-5">
              <div className="mb-2 flex items-center gap-3">
                <Stars rating={r.rating} />
                {r.title && (
                  <h3 className="font-semibold text-brand-indigo">{r.title}</h3>
                )}
              </div>
              <p className="mb-3 text-[0.92rem] leading-relaxed text-brand-ink">{r.body}</p>
              <div className="text-[0.78rem] text-brand-ink-soft">
                {r.authorName} · {formatDate(r.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
