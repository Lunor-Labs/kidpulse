import Image from 'next/image';
import { AddToCartButton } from '@/components/features/cart/AddToCartButton';
import type { Product } from '@/types/catalog';

const CARD_BG: Record<string, string> = {
  'painting-kits':    'bg-[#fff4e0]',
  'stem-kits':        'bg-[#e7f6ff]',
  'gift-collections': 'bg-[#fde9f0]',
  'learning-toys':    'bg-[#eef8e1]',
};

const CARD_EMOJI: Record<string, string> = {
  'painting-kits':    '🦄',
  'stem-kits':        '🧪',
  'gift-collections': '🎁',
  'learning-toys':    '🦁',
};

function formatPrice(paise: number) {
  return `Rs. ${paise.toLocaleString('en-LK')}`;
}

function discountPercent(price: number, compareAt: number) {
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-[0.78rem] tracking-[1px] text-brand-gold-deep">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const slug  = product.category.slug;
  const bg    = CARD_BG[slug]    ?? 'bg-brand-cream';
  const emoji = CARD_EMOJI[slug] ?? '🎨';
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const pct = hasDiscount ? discountPercent(product.price, product.compareAtPrice!) : null;
  const isNew = !hasDiscount && product.isFeatured;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[18px] border border-brand-line bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-[0_16px_32px_rgba(27,11,128,0.12)]">

      {/* Image area */}
      <div className={`relative h-[160px] ${bg} flex items-center justify-center text-[3.4rem]`}>
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden>{emoji}</span>
        )}

        {/* Discount / New badge */}
        {pct && (
          <span className="absolute left-[10px] top-[10px] rounded-full bg-brand-berry px-[9px] py-1 text-[0.68rem] font-bold text-white">
            -{pct}%
          </span>
        )}
        {isNew && (
          <span className="absolute left-[10px] top-[10px] rounded-full bg-brand-olive px-[9px] py-1 text-[0.68rem] font-bold text-white">
            New
          </span>
        )}

        {/* Wishlist button */}
        <button
          aria-label="Add to wishlist"
          className="absolute right-[10px] top-[10px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90 text-[0.95rem] text-brand-berry hover:bg-white"
        >
          ♡
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-[14px]">

        {/* Category tag */}
        <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.04em] text-brand-sky-deep">
          {product.category.name}
        </div>

        {/* Product name */}
        <h3 className="mb-[6px] min-h-[34px] text-[0.88rem] font-bold leading-[1.3] text-brand-ink line-clamp-2">
          {product.name}
        </h3>

        {/* Star rating — static display rating */}
        <div className="mb-2 flex items-center gap-[5px]">
          <StarRating rating={4.9} />
          <span className="text-[0.74rem] text-brand-ink-soft">(386)</span>
        </div>

        {/* Price row */}
        <div className="mb-[10px] flex items-baseline gap-[6px]">
          <span className="text-[1.05rem] font-bold text-brand-indigo">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[0.78rem] text-[#aaa] line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <div className="mt-auto">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}