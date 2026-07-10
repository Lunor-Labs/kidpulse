'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchDropdown } from './SearchDropdown';

const PRODUCTS = [
  { name: 'DIY 3D Character Painting Kit', slug: 'diy-3d-character-painting-kit', category: 'Painting Kits', categorySlug: 'painting-kits', price: 2500 },
  { name: 'KidPulse STEM Science Kit',     slug: 'kidpulse-stem-science-kit',     category: 'STEM Kits',     categorySlug: 'stem-kits',     price: 5100 },
  { name: 'Custom Return Gift Set',        slug: 'custom-return-gift-set',        category: 'Gift Collections', categorySlug: 'gift-collections', price: 4200 },
  { name: 'Sea Theme Painting Kit',        slug: 'sea-theme-painting-kit',        category: 'Painting Kits', categorySlug: 'painting-kits', price: 3890 },
  { name: 'Animal World Learning Set',     slug: 'animal-world-learning-set',     category: 'Learning Toys', categorySlug: 'learning-toys', price: 5062 },
  { name: 'Junior Microscope Explorer Kit',slug: 'junior-microscope-kit',         category: 'STEM Kits',     categorySlug: 'stem-kits',     price: 6200 },
  { name: 'Dinosaur Painting Kit',         slug: 'dinosaur-painting-kit',         category: 'Painting Kits', categorySlug: 'painting-kits', price: 2900 },
  { name: 'Rainbow Slime Science Kit',     slug: 'rainbow-slime-kit',             category: 'STEM Kits',     categorySlug: 'stem-kits',     price: 3400 },
  { name: 'Birthday Gift Box Deluxe',      slug: 'birthday-gift-box-deluxe',      category: 'Gift Collections', categorySlug: 'gift-collections', price: 7500 },
];

const CATEGORIES = [
  { name: 'Painting Kits',    slug: 'painting-kits',    count: 3 },
  { name: 'STEM Kits',        slug: 'stem-kits',        count: 3 },
  { name: 'Gift Collections', slug: 'gift-collections', count: 2 },
  { name: 'Learning Toys',    slug: 'learning-toys',    count: 1 },
];

export interface ProductSuggestion {
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
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

function getSuggestions(query: string): SearchSuggestions {
  const q = query.toLowerCase().trim();

  const products = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  ).slice(0, 5);

  const categories = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(q)
  ).slice(0, 3);

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

  /* ── Update suggestions when query changes ── */
  useEffect(() => {
    if (query.length >= 3) {
      const results = getSuggestions(query);
      setSuggestions(results);
      setOpen(results.products.length > 0 || results.categories.length > 0);
    } else {
      setSuggestions({ products: [], categories: [] });
      setOpen(false);
    }
    setActiveIndex(-1);
  }, [query]);

  /* ── Close on outside click ── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ── Navigate to search results ── */
  const navigateToResults = useCallback((q: string) => {
    if (!q.trim()) return;
    setOpen(false);
    setQuery('');
    router.push(`/products?q=${encodeURIComponent(q.trim())}`);
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

  /* ── Keyboard navigation ── */
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
          if (s.type === 'product')   navigateToProduct(s.slug);
          if (s.type === 'category')  navigateToCategory(s.slug);
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

      {/* Dropdown */}
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