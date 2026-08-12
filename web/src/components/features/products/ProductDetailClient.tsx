'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cartStore';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { WishlistButton } from './WishlistButton';
import { MultiStageSelector, type MultiStageSelectorValue, type VariantStage } from './MultiStageSelector';
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
  const hasMultiStage =
    product.hasMultiStageVariants === true && (product.variantStages?.length ?? 0) > 0;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.find((v) => v.stockQuantity > 0) ?? variants[0] ?? null
  );
  const [multiStageValue, setMultiStageValue] = useState<MultiStageSelectorValue | null>(null);
  const [quantity, setQuantity] = useState(1);

  let activePrice = product.price;
  let activeCompareAt = product.compareAtPrice;
  let activeStock = product.stockQuantity;

  if (hasMultiStage) {
    if (multiStageValue?.priceOverride != null) {
      activePrice = multiStageValue.priceOverride;
    }
    if (multiStageValue && product.variantStages) {
      const stage2 = product.variantStages.find((s) => s.stageOrder === 1);
      if (stage2) {
        const selectedOptions = stage2.options.filter((o) =>
          multiStageValue.stage2OptionIds.includes(o.id)
        );
        if (selectedOptions.length > 0) {
          activeStock = Math.min(...selectedOptions.map((o) => o.stockQuantity));
        }
      }
    }
  } else if (hasVariants && selectedVariant) {
    activePrice = selectedVariant.price;
    activeCompareAt = selectedVariant.compareAtPrice;
    activeStock = selectedVariant.stockQuantity;
  }

  const isOutOfStock = activeStock === 0;
  const pct = activeCompareAt ? discountPercent(activePrice, activeCompareAt) : null;
  const rating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const multiStageReady = !hasMultiStage || multiStageValue !== null;
  const canAddToCart = !isOutOfStock && multiStageReady;

  const handleAddToCart = () => {
    if (hasMultiStage && multiStageValue) {
      addItem(
        {
          productId: product.id,
          variantId: null,
          variantLabel: multiStageValue.displayLabel,
          stageOptionIds: multiStageValue.stage2OptionIds, // passed for stock decrement
          name: product.name,
          price: activePrice,
          imageUrl: product.images[0]?.url ?? null,
        },
        quantity
      );
    } else {
      addItem(
        {
          productId: product.id,
          variantId: selectedVariant?.id ?? null,
          variantLabel: selectedVariant?.label ?? null,
          stageOptionIds: null,
          name: product.name,
          price: activePrice,
          imageUrl: selectedVariant?.imageUrl ?? product.images[0]?.url ?? null,
        },
        quantity
      );
    }
    toast.success(`${product.name} added to cart!`);
    setQuantity(1);
    if (hasMultiStage) setMultiStageValue(null);
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
            {activeStock <= (product.lowStockAlert ?? 5) && activeStock > 0 && (
              <span className="ml-2 text-brand-berry">· Only {activeStock} left!</span>
            )}
          </span>
        )}
      </div>

      {hasMultiStage && product.variantStages ? (
        <div className="mb-5">
          <MultiStageSelector
            stages={product.variantStages as VariantStage[]}
            onChange={setMultiStageValue}
          />
        </div>
      ) : hasVariants ? (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariant?.id ?? null}
          onSelect={(v) => {
            setSelectedVariant(v);
            setQuantity(1);
          }}
        />
      ) : null}

      {!isOutOfStock && (
        <QuantitySelector
          quantity={quantity}
          maxQuantity={Math.min(activeStock, 10)}
          onChange={setQuantity}
        />
      )}

      <button
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        className="mb-3 w-full rounded-[14px] bg-brand-indigo py-4 text-[1rem] font-bold text-white transition-colors hover:bg-brand-indigo-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOutOfStock
          ? '✕ Out of Stock'
          : hasMultiStage && !multiStageValue
            ? 'Select your characters to continue'
            : '🛒 Add to Cart'}
      </button>

      <WishlistButton productId={product.id} variant="bar" />

      <div className="mt-6 border-t border-brand-line pt-5">
        <h2 className="mb-3 font-chewy text-[1.1rem] text-brand-indigo">About this kit</h2>
        <div
          className="prose prose-sm max-w-none text-brand-ink-soft [&_h1]:font-chewy [&_h1]:text-brand-indigo [&_h2]:font-chewy [&_h2]:text-brand-indigo [&_h3]:font-semibold [&_h3]:text-brand-ink [&_img]:rounded-[12px] [&_img]:my-3"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>

      {product.ageRangeMin && product.ageRangeMax && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-brand-cream px-4 py-2 text-[0.82rem] font-semibold text-brand-indigo">
          👶 Recommended for ages {product.ageRangeMin}–{product.ageRangeMax}
        </div>
      )}
    </div>
  );
}