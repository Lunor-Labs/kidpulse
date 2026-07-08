'use client';

interface ActiveFiltersProps {
  selectedCategories: string[];
  categoryNames: Record<string, string>;
  maxPrice: number;
  selectedMinAge: number | null;
  selectedMaxAge: number | null;
  onRemoveCategory: (slug: string) => void;
  onRemovePrice: () => void;
  onRemoveAge: () => void;
  onClearAll: () => void;
}

const MAX_PRICE = 15000;

function formatPrice(val: number) {
  return `Rs. ${val.toLocaleString('en-LK')}`;
}

function ageLabel(min: number, max: number) {
  return max === 99 ? `Ages ${min}+` : `Ages ${min}–${max}`;
}

export function ActiveFilters({
  selectedCategories,
  categoryNames,
  maxPrice,
  selectedMinAge,
  selectedMaxAge,
  onRemoveCategory,
  onRemovePrice,
  onRemoveAge,
  onClearAll,
}: ActiveFiltersProps) {
  const hasPrice = maxPrice < MAX_PRICE;
  const hasAge = selectedMinAge !== null && selectedMaxAge !== null;
  const hasAny = selectedCategories.length > 0 || hasPrice || hasAge;

  if (!hasAny) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {/* Category pills */}
      {selectedCategories.map((slug) => (
        <span
          key={slug}
          className="inline-flex items-center gap-[6px] rounded-full border border-brand-indigo/20 bg-brand-indigo/8 px-3 py-1 text-[0.78rem] font-bold text-brand-indigo"
        >
          {categoryNames[slug] ?? slug}
          <button
            onClick={() => onRemoveCategory(slug)}
            aria-label={`Remove ${categoryNames[slug]} filter`}
            className="text-[0.9rem] leading-none hover:text-brand-berry"
          >
            ×
          </button>
        </span>
      ))}

      {/* Price pill */}
      {hasPrice && (
        <span className="inline-flex items-center gap-[6px] rounded-full border border-brand-indigo/20 bg-brand-indigo/8 px-3 py-1 text-[0.78rem] font-bold text-brand-indigo">
          Under {formatPrice(maxPrice)}
          <button
            onClick={onRemovePrice}
            aria-label="Remove price filter"
            className="text-[0.9rem] leading-none hover:text-brand-berry"
          >
            ×
          </button>
        </span>
      )}

      {/* Age pill */}
      {hasAge && (
        <span className="inline-flex items-center gap-[6px] rounded-full border border-brand-indigo/20 bg-brand-indigo/8 px-3 py-1 text-[0.78rem] font-bold text-brand-indigo">
          {ageLabel(selectedMinAge!, selectedMaxAge!)}
          <button
            onClick={onRemoveAge}
            aria-label="Remove age filter"
            className="text-[0.9rem] leading-none hover:text-brand-berry"
          >
            ×
          </button>
        </span>
      )}

      {/* Clear all */}
      <button
        onClick={onClearAll}
        className="text-[0.78rem] font-bold text-brand-berry hover:text-brand-berry-deep"
      >
        Clear all
      </button>
    </div>
  );
}