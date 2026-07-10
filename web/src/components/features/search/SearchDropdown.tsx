'use client';

import type { SearchSuggestions } from './SearchBar';

function formatPrice(p: number) {
  return `Rs. ${p.toLocaleString('en-LK')}`;
}

const CATEGORY_EMOJI: Record<string, string> = {
  'painting-kits':    '🖌️',
  'stem-kits':        '🧪',
  'gift-collections': '🎁',
  'learning-toys':    '🦁',
};

interface SearchDropdownProps {
  query: string;
  suggestions: SearchSuggestions;
  activeIndex: number;
  onSelectProduct:  (slug: string) => void;
  onSelectCategory: (slug: string) => void;
  onSearchAll:      () => void;
}

export function SearchDropdown({
  query,
  suggestions,
  activeIndex,
  onSelectProduct,
  onSelectCategory,
  onSearchAll,
}: SearchDropdownProps) {
  const hasCategories = suggestions.categories.length > 0;
  const hasProducts   = suggestions.products.length > 0;

  /* activeIndex maps: categories first, then products */
  const catCount = suggestions.categories.length;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[16px] border border-brand-line bg-white shadow-[0_16px_40px_rgba(27,11,128,0.16)]">

      {/* ── Categories group ── */}
      {hasCategories && (
        <div>
          <div className="px-4 pt-3 pb-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-brand-ink-soft">
            Categories
          </div>
          {suggestions.categories.map((cat, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={cat.slug}
                onMouseDown={() => onSelectCategory(cat.slug)}
                className={`flex w-full items-center gap-3 px-4 py-[10px] text-left transition-colors duration-100 ${
                  isActive ? 'bg-brand-indigo/5' : 'hover:bg-brand-indigo/5'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-brand-cream text-base">
                  {CATEGORY_EMOJI[cat.slug] ?? '📦'}
                </span>
                <span className="flex-1">
                  <span className="block text-[0.88rem] font-bold text-brand-ink">
                    {cat.name}
                  </span>
                  <span className="text-[0.74rem] text-brand-ink-soft">
                    {cat.count} products
                  </span>
                </span>
                <span className="text-[0.74rem] text-brand-ink-soft">→</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Divider between groups */}
      {hasCategories && hasProducts && (
        <div className="mx-4 my-1 h-px bg-brand-line" />
      )}

      {/* ── Products group ── */}
      {hasProducts && (
        <div>
          <div className="px-4 pt-2 pb-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-brand-ink-soft">
            Products
          </div>
          {suggestions.products.map((product, i) => {
            const isActive = activeIndex === catCount + i;
            return (
              <button
                key={product.slug}
                onMouseDown={() => onSelectProduct(product.slug)}
                className={`flex w-full items-center gap-3 px-4 py-[10px] text-left transition-colors duration-100 ${
                  isActive ? 'bg-brand-indigo/5' : 'hover:bg-brand-indigo/5'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-brand-cream text-base">
                  {CATEGORY_EMOJI[product.categorySlug] ?? '🎨'}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-[0.88rem] font-bold text-brand-ink">
                    {highlightMatch(product.name, query)}
                  </span>
                  <span className="text-[0.74rem] text-brand-ink-soft">
                    {product.category} · {formatPrice(product.price)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Search all footer ── */}
      <div className="border-t border-brand-line">
        <button
          onMouseDown={onSearchAll}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-brand-indigo/5"
        >
          <span className="text-[0.84rem] font-bold text-brand-indigo">
            🔍 Search all results for &ldquo;{query}&rdquo;
          </span>
          <span className="text-[0.74rem] text-brand-ink-soft">Enter ↵</span>
        </button>
      </div>
    </div>
  );
}

/* Highlight matching text in product name */
function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-gold/30 text-brand-ink not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}