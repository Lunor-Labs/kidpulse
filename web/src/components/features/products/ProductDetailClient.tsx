'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cartStore';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { WishlistButton } from './WishlistButton';
import type { Product, Variant } from '@/types/catalog';

function discountPercent(price: number, compareAt: number) {
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function formatPrice(p: number) {
  return `Rs. ${p.toLocaleString('en-LK')}`;
}

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const addItem = useCartStore((s) => s.addItem);

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.find((v) => v.stockQuantity > 0) ?? variants[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);

  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const activeStock = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const isOutOfStock = activeStock === 0;
  const pct = activeCompareAt ? discountPercent(activePrice, activeCompareAt) : null;

  const rating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        variantLabel: selectedVariant?.label ?? null,
        name: product.name,
        price: activePrice,
        imageUrl: selectedVariant?.imageUrl ?? product.images[0]?.url ?? null,
      },
      quantity
    );
    toast.success(`${product.name} added to cart!`);
    setQuantity(1);
  };

  return (
    <div>
      <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-brand-sky-deep">
        {product.category.name}
      </div>

      <h1 className="mb-3 font-chewy text-[1.9rem] leading-tight text-brand-indigo">
        {product.name}
      </h1>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-[0.9rem] tracking-[1px] text-brand-gold-deep">
          {'★'.repeat(Math.round(rating) || 5)}
          <span className="text-brand-line">
            {'★'.repeat(Math.max(0, 5 - (Math.round(rating) || 5)))}
          </span>
        </span>
        <span className="text-[0.82rem] text-brand-ink-soft">
          {reviewCount > 0
            ? `${rating.toFixed(1)} · ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`
            : 'No reviews yet'}
        </span>
      </div>

      <div className="mb-2 flex items-baseline gap-3">
        <span className="text-[1.6rem] font-bold text-brand-indigo">
          {formatPrice(activePrice)}
        </span>
        {activeCompareAt && (
          <span className="text-[0.95rem] text-brand-ink-soft line-through">
            {formatPrice(activeCompareAt)}
          </span>
        )}
        {pct && (
          <span className="rounded-full bg-brand-berry px-[10px] py-[3px] text-[0.74rem] font-bold text-white">
            Save {pct}%
          </span>
        )}
      </div>

      <div className="mb-5">
        {isOutOfStock ? (
          <span className="text-[0.84rem] font-bold text-brand-berry">✕ Out of stock</span>
        ) : (
          <span className="text-[0.84rem] font-bold text-brand-olive">
            ✔ In stock
            {activeStock <= (product.lowStockAlert ?? 5) && (
              <span className="ml-2 text-brand-berry">· Only {activeStock} left!</span>
            )}
          </span>
        )}
      </div>

      {hasVariants && (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariant?.id ?? null}
          onSelect={(v) => {
            setSelectedVariant(v);
            setQuantity(1);
          }}
        />
      )}

      {!isOutOfStock && (
        <QuantitySelector
          quantity={quantity}
          maxQuantity={Math.min(activeStock, 10)}
          onChange={setQuantity}
        />
      )}

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="mb-3 w-full rounded-[14px] bg-brand-indigo py-4 text-[1rem] font-bold text-white transition-colors hover:bg-brand-indigo-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOutOfStock ? '✕ Out of Stock' : '🛒 Add to Cart'}
      </button>

      <WishlistButton productId={product.id} variant="bar" />

      <div className="mt-6 border-t border-brand-line pt-5">
        <h2 className="mb-3 font-chewy text-[1.1rem] text-brand-indigo">About this kit</h2>
        <p className="text-[0.92rem] leading-relaxed text-brand-ink-soft">
          {product.description}
        </p>
      </div>

      {product.ageRangeMin && product.ageRangeMax && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-brand-cream px-4 py-2 text-[0.82rem] font-semibold text-brand-indigo">
          👶 Recommended for ages {product.ageRangeMin}–{product.ageRangeMax}
        </div>
      )}
    </div>
  );
}
