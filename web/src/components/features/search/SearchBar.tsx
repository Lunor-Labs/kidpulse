'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchDropdown } from './SearchDropdown';
import type { ProductSuggestion as ApiProductSuggestion } from '@/types/catalog';

export interface ProductSuggestion {
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  imageUrl?: string | null;
}

export interface CategorySuggestion {
  name: string;
  slug: string;
  count: number;
}

export interface SearchSuggestions {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
}

const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000')
    : (process.env.API_URL ?? 'http://localhost:4000');

async function fetchSuggestions(query: string): Promise<SearchSuggestions> {
  const res = await fetch(
    `${API_BASE}/api/v1/products/search?q=${encodeURIComponent(query)}&limit=5`,
    { cache: 'no-store' }
  );
  if (!res.ok) return { products: [], categories: [] };

  const json = await res.json();
  const raw: ApiProductSuggestion[] = json.data ?? [];

  // Map API shape → local shape
  const products: ProductSuggestion[] = raw.map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.categoryName,
    categorySlug: p.categoryName.toLowerCase().replace(/\s+/g, '-'),
    price: p.price,
    imageUrl: p.imageUrl,
  }));

  // Derive unique categories from the product results
  const catMap = new Map<string, CategorySuggestion>();
  for (const p of products) {
    if (!catMap.has(p.categorySlug)) {
      catMap.set(p.categorySlug, { name: p.category, slug: p.categorySlug, count: 0 });
    }
    catMap.get(p.categorySlug)!.count += 1;
  }
  const categories = [...catMap.values()].slice(0, 3);

  return { products, categories };
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-[15px] top-1/2 h-4 w-4 -translate-y-1/2 opacity-45"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function SearchBar() {
  const router  = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({ products: [], categories: [] });
  const [open,        setOpen]        = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const allSuggestions = [
    ...suggestions.categories.map((c) => ({ type: 'category' as const, ...c })),
    ...suggestions.products.map((p)   => ({ type: 'product'  as const, ...p })),
  ];

  // Debounced API fetch — fires 250ms after the user stops typing
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions({ products: [], categories: [] });
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(query).then((results) => {
        setSuggestions(results);
        setOpen(results.products.length > 0 || results.categories.length > 0);
        setActiveIndex(-1);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigateToResults = useCallback((q: string) => {
    if (!q.trim()) return;
    setOpen(false);
    setQuery('');
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }, [router]);

  const navigateToProduct = useCallback((slug: string) => {
    setOpen(false);
    setQuery('');
    router.push(`/products/${slug}`);
  }, [router]);

  const navigateToCategory = useCallback((slug: string) => {
    setOpen(false);
    setQuery('');
    router.push(`/products?category=${slug}`);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'Enter') navigateToResults(query);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allSuggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && allSuggestions[activeIndex]) {
          const s = allSuggestions[activeIndex];
          if (s.type === 'product')  navigateToProduct(s.slug);
          if (s.type === 'category') navigateToCategory(s.slug);
        } else {
          navigateToResults(query);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapRef} className="relative max-w-[480px] flex-1 max-[980px]:order-3 max-[980px]:basis-full max-[980px]:max-w-full">
      <SearchIcon />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 3 && setOpen(true)}
        placeholder="Search painting kits, STEM toys, gifts..."
        aria-label="Search products"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        className="w-full rounded-full border-none bg-white py-[11px] pl-[42px] pr-[18px] font-sans text-[0.92rem] text-brand-ink placeholder:text-brand-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-sky/30"
      />

      {open && (
        <SearchDropdown
          query={query}
          suggestions={suggestions}
          activeIndex={activeIndex}
          onSelectProduct={navigateToProduct}
          onSelectCategory={navigateToCategory}
          onSearchAll={() => navigateToResults(query)}
        />
      )}
    </div>
  );
}