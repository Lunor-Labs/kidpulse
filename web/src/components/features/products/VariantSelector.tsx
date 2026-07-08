'use client';

import type { Variant } from '@/types/catalog';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variant: Variant) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-brand-ink-soft">
        Age Range
      </h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.id === selectedVariantId;
          const isOos = v.stockQuantity === 0;

          return (
            <button
              key={v.id}
              onClick={() => !isOos && onSelect(v)}
              disabled={isOos}
              aria-pressed={isSelected}
              aria-label={`${v.label}${isOos ? ' — out of stock' : ''}`}
              className={`relative rounded-full border-2 px-4 py-[7px] text-[0.86rem] font-bold transition-all duration-150
                ${isOos
                  ? 'cursor-not-allowed border-brand-line text-brand-ink-soft opacity-40 line-through'
                  : isSelected
                  ? 'border-brand-indigo bg-brand-indigo text-white'
                  : 'border-brand-line text-brand-ink hover:border-brand-indigo/50'
                }`}
            >
              {v.label}
              {isOos && (
                <span className="sr-only"> (out of stock)</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[0.74rem] text-brand-ink-soft">
        Strikethrough variants are currently out of stock.
      </p>
    </div>
  );
}