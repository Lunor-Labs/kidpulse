'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '@/components/features/home/ProductCard';
import { ActiveFilters } from './ActiveFilters';
import { FilterSidebar } from './FilterSidebar';
import type { Category, Product } from '@/types/catalog';

const MAX_PRICE = 15000;


const SORT_OPTIONS = [
  { value: 'featured',    label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newest first' },
];

interface ProductsClientProps {
  products: Product[];
  categories: Category[];
  initialCategories: string[];
  initialMaxPrice: number;
  initialMinAge: number | null;
  initialMaxAge: number | null;
  initialSort: string;
  initialQuery: string;
}

export function ProductsClient({
  products,
  categories,
  initialCategories,
  initialMaxPrice,
  initialMinAge,
  initialMaxAge,
  initialSort,
  initialQuery,
}: ProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [maxPrice,           setMaxPrice]           = useState<number>(initialMaxPrice);
  const [selectedMinAge,     setSelectedMinAge]     = useState<number | null>(initialMinAge);
  const [selectedMaxAge,     setSelectedMaxAge]     = useState<number | null>(initialMaxAge);
  const [sort,               setSort]               = useState<string>(initialSort);
  const [query,              setQuery]              = useState<string>(initialQuery);
  const [filtersOpen,        setFiltersOpen]        = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen]);

  const pushUrl = useCallback(
    (
      cats: string[],
      price: number,
      minAge: number | null,
      maxAge: number | null,
      s: string,
      q: string,
    ) => {
      const p = new URLSearchParams();
      cats.forEach((c) => p.append('category', c));
      if (price < MAX_PRICE) p.set('maxPrice', String(price));
      if (minAge !== null)   p.set('minAge',   String(minAge));
      if (maxAge !== null)   p.set('maxAge',   String(maxAge));
      if (s !== 'featured')  p.set('sort',     s);
      if (q.trim())          p.set('q',        q.trim());
      const qs = p.toString();
      startTransition(() => {
        router.push(pathname + (qs ? `?${qs}` : ''), { scroll: false });
      });
    },
    [router, pathname]
  );

  const handleCategoryChange = (slug: string, checked: boolean) => {
    const next = checked
      ? [...selectedCategories, slug]
      : selectedCategories.filter((c) => c !== slug);
    setSelectedCategories(next);
    pushUrl(next, maxPrice, selectedMinAge, selectedMaxAge, sort, query);
  };

  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(value);
    pushUrl(selectedCategories, value, selectedMinAge, selectedMaxAge, sort, query);
  };

  const handleAgeChange = (minAge: number | null, maxAge: number | null) => {
    setSelectedMinAge(minAge);
    setSelectedMaxAge(maxAge);
    pushUrl(selectedCategories, maxPrice, minAge, maxAge, sort, query);
  };

  const handleSort = (value: string) => {
    setSort(value);
    pushUrl(selectedCategories, maxPrice, selectedMinAge, selectedMaxAge, value, query);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setMaxPrice(MAX_PRICE);
    setSelectedMinAge(null);
    setSelectedMaxAge(null);
    setSort('featured');
    setQuery('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  const activeFilterCount =
    selectedCategories.length +
    (maxPrice < MAX_PRICE ? 1 : 0) +
    (selectedMinAge !== null || selectedMaxAge !== null ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-8 py-10 max-[980px]:px-4">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-chewy text-[2rem] text-brand-indigo">
            {query ? `Results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-[0.88rem] text-brand-ink-soft">
            {products.length} product{products.length !== 1 ? 's' : ''} found
            {isPending && <span className="ml-2 text-brand-sky-deep">· Updating…</span>}
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-[10px] border border-brand-line bg-white px-4 py-2 text-[0.88rem] text-brand-ink outline-none focus:border-brand-indigo"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <ActiveFilters
        selectedCategories={selectedCategories}
        categoryNames={categoryNames}
        maxPrice={maxPrice}
        selectedMinAge={selectedMinAge}
        selectedMaxAge={selectedMaxAge}
        onRemoveCategory={(slug) => handleCategoryChange(slug, false)}
        onRemovePrice={() => handleMaxPriceChange(MAX_PRICE)}
        onRemoveAge={() => handleAgeChange(null, null)}
        onClearAll={handleClearAll}
      />

      <div className="mb-3 hidden max-[980px]:block">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-2 text-[0.82rem] font-semibold text-brand-ink shadow-sm"
          aria-label="Open filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-indigo px-1.5 text-[0.7rem] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8 items-start">
        <div className="max-[980px]:hidden">
          <FilterSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            maxPrice={maxPrice}
            selectedMinAge={selectedMinAge}
            selectedMaxAge={selectedMaxAge}
            onCategoryChange={handleCategoryChange}
            onMaxPriceChange={handleMaxPriceChange}
            onAgeChange={handleAgeChange}
          />
        </div>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 min-[981px]:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setFiltersOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[340px] overflow-y-auto bg-white shadow-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-line bg-white px-4 py-3">
                <span className="font-chewy text-[1.15rem] text-brand-indigo">Filters</span>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="rounded-full p-1 text-brand-ink hover:bg-brand-cream"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <FilterSidebar
                  categories={categories}
                  selectedCategories={selectedCategories}
                  maxPrice={maxPrice}
                  selectedMinAge={selectedMinAge}
                  selectedMaxAge={selectedMaxAge}
                  onCategoryChange={handleCategoryChange}
                  onMaxPriceChange={handleMaxPriceChange}
                  onAgeChange={handleAgeChange}
                />
              </div>
              <div className="sticky bottom-0 z-10 flex gap-2 border-t border-brand-line bg-white px-3 py-3">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex-1 rounded-full border border-brand-line px-4 py-2 text-[0.85rem] font-semibold text-brand-ink"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 rounded-full bg-brand-indigo px-4 py-2 text-[0.85rem] font-semibold text-white"
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="mb-4 text-5xl">🔍</span>
              <h3 className="font-chewy text-[1.4rem] text-brand-indigo mb-2">
                No products found
              </h3>
              <p className="text-[0.9rem] text-brand-ink-soft mb-6">
                {query
                  ? `No products matched "${query}". Try a different search or clear your filters.`
                  : 'Try adjusting or clearing your filters.'}
              </p>
              <button
                onClick={handleClearAll}
                className="rounded-[12px] bg-brand-indigo px-6 py-3 text-[0.9rem] font-bold text-white hover:bg-brand-indigo-soft"
              >
                {query ? 'Clear search' : 'Clear all filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
