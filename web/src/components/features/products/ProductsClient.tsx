'use client';

import { useCallback, useState, useTransition } from 'react';
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

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">
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

      <div className="flex gap-8 items-start">
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
