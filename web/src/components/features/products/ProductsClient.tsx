'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '@/components/features/home/ProductCard';
import { ActiveFilters } from './ActiveFilters';
import { FilterSidebar } from './FilterSidebar';
import type { Product } from '@/types/catalog';

const MAX_PRICE = 15000;

const FALLBACK_PRODUCTS: Product[] = [
  { id:'1', name:'DIY 3D Character Painting Kit', slug:'diy-3d-character-painting-kit', description:'', price:2500, compareAtPrice:12690, sku:'PK-001', stockQuantity:50, ageRangeMin:5, ageRangeMax:12, isFeatured:true, isBestSeller:true, category:{ id:'1', name:'Painting Kits', slug:'painting-kits' }, images:[] },
  { id:'2', name:'KidPulse STEM Science Kit', slug:'kidpulse-stem-science-kit', description:'', price:5100, compareAtPrice:8500, sku:'SK-001', stockQuantity:30, ageRangeMin:6, ageRangeMax:12, isFeatured:true, isBestSeller:true, category:{ id:'2', name:'STEM Kits', slug:'stem-kits' }, images:[] },
  { id:'3', name:'Custom Return Gift Set', slug:'custom-return-gift-set', description:'', price:4200, compareAtPrice:null, sku:'GC-001', stockQuantity:20, ageRangeMin:null, ageRangeMax:null, isFeatured:false, isBestSeller:true, category:{ id:'3', name:'Gift Collections', slug:'gift-collections' }, images:[] },
  { id:'4', name:'Sea Theme Painting Kit', slug:'sea-theme-painting-kit', description:'', price:3890, compareAtPrice:null, sku:'PK-002', stockQuantity:40, ageRangeMin:4, ageRangeMax:10, isFeatured:false, isBestSeller:true, category:{ id:'1', name:'Painting Kits', slug:'painting-kits' }, images:[] },
  { id:'5', name:'Animal World Learning Set', slug:'animal-world-learning-set', description:'', price:5062, compareAtPrice:6750, sku:'LT-001', stockQuantity:25, ageRangeMin:3, ageRangeMax:10, isFeatured:false, isBestSeller:true, category:{ id:'4', name:'Learning Toys', slug:'learning-toys' }, images:[] },
  { id:'6', name:'Junior Microscope Explorer Kit', slug:'junior-microscope-kit', description:'', price:6200, compareAtPrice:null, sku:'SK-002', stockQuantity:18, ageRangeMin:8, ageRangeMax:12, isFeatured:false, isBestSeller:false, category:{ id:'2', name:'STEM Kits', slug:'stem-kits' }, images:[] },
  { id:'7', name:'Dinosaur Painting Kit', slug:'dinosaur-painting-kit', description:'', price:2900, compareAtPrice:4500, sku:'PK-003', stockQuantity:35, ageRangeMin:4, ageRangeMax:9, isFeatured:false, isBestSeller:false, category:{ id:'1', name:'Painting Kits', slug:'painting-kits' }, images:[] },
  { id:'8', name:'Rainbow Slime Science Kit', slug:'rainbow-slime-kit', description:'', price:3400, compareAtPrice:null, sku:'SK-003', stockQuantity:22, ageRangeMin:6, ageRangeMax:12, isFeatured:false, isBestSeller:false, category:{ id:'2', name:'STEM Kits', slug:'stem-kits' }, images:[] },
  { id:'9', name:'Birthday Gift Box Deluxe', slug:'birthday-gift-box-deluxe', description:'', price:7500, compareAtPrice:9800, sku:'GC-002', stockQuantity:12, ageRangeMin:null, ageRangeMax:null, isFeatured:false, isBestSeller:false, category:{ id:'3', name:'Gift Collections', slug:'gift-collections' }, images:[] },
];

const FALLBACK_CATEGORIES = [
  { slug:'painting-kits',    name:'Painting Kits',    productCount: FALLBACK_PRODUCTS.filter(p => p.category.slug === 'painting-kits').length },
  { slug:'stem-kits',        name:'STEM Kits',        productCount: FALLBACK_PRODUCTS.filter(p => p.category.slug === 'stem-kits').length },
  { slug:'gift-collections', name:'Gift Collections', productCount: FALLBACK_PRODUCTS.filter(p => p.category.slug === 'gift-collections').length },
  { slug:'learning-toys',    name:'Learning Toys',    productCount: FALLBACK_PRODUCTS.filter(p => p.category.slug === 'learning-toys').length },
];

const SORT_OPTIONS = [
  { value:'featured',    label:'Featured' },
  { value:'price-asc',  label:'Price: Low to High' },
  { value:'price-desc', label:'Price: High to Low' },
  { value:'newest',     label:'Newest first' },
];

interface ProductsClientProps {
  initialCategories: string[];
  initialMaxPrice: number;
  initialMinAge: number | null;
  initialMaxAge: number | null;
  initialSort: string;
}

export function ProductsClient({
  initialCategories,
  initialMaxPrice,
  initialMinAge,
  initialMaxAge,
  initialSort,
}: ProductsClientProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [maxPrice,           setMaxPrice]           = useState<number>(initialMaxPrice);
  const [selectedMinAge,     setSelectedMinAge]     = useState<number | null>(initialMinAge);
  const [selectedMaxAge,     setSelectedMaxAge]     = useState<number | null>(initialMaxAge);
  const [sort,               setSort]               = useState<string>(initialSort);

  /* ── Sync filters → URL ── */
  const pushUrl = useCallback(
    (cats: string[], price: number, minAge: number | null, maxAge: number | null, s: string) => {
      const p = new URLSearchParams();
      cats.forEach((c) => p.append('category', c));
      if (price < MAX_PRICE) p.set('maxPrice', String(price));
      if (minAge !== null)   p.set('minAge',   String(minAge));
      if (maxAge !== null)   p.set('maxAge',   String(maxAge));
      if (s !== 'featured')  p.set('sort',     s);
      const qs = p.toString();
      router.push(pathname + (qs ? `?${qs}` : ''), { scroll: false });
    },
    [router, pathname]
  );

  /* ── Filter handlers ── */
  const handleCategoryChange = (slug: string, checked: boolean) => {
    const next = checked
      ? [...selectedCategories, slug]
      : selectedCategories.filter((c) => c !== slug);
    setSelectedCategories(next);
    pushUrl(next, maxPrice, selectedMinAge, selectedMaxAge, sort);
  };

  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(value);
    pushUrl(selectedCategories, value, selectedMinAge, selectedMaxAge, sort);
  };

  const handleAgeChange = (minAge: number | null, maxAge: number | null) => {
    setSelectedMinAge(minAge);
    setSelectedMaxAge(maxAge);
    pushUrl(selectedCategories, maxPrice, minAge, maxAge, sort);
  };

  const handleSort = (value: string) => {
    setSort(value);
    pushUrl(selectedCategories, maxPrice, selectedMinAge, selectedMaxAge, value);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setMaxPrice(MAX_PRICE);
    setSelectedMinAge(null);
    setSelectedMaxAge(null);
    setSort('featured');
    router.push(pathname, { scroll: false });
  };

  /* ── Filter + sort products ── */
  const filtered = useMemo(() => {
    let list = [...FALLBACK_PRODUCTS];

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category.slug));
    }
    if (maxPrice < MAX_PRICE) {
      list = list.filter((p) => p.price <= maxPrice);
    }
    if (selectedMinAge !== null && selectedMaxAge !== null) {
      list = list.filter((p) => {
        if (p.ageRangeMin === null || p.ageRangeMax === null) return false;
        return p.ageRangeMax >= selectedMinAge! && p.ageRangeMin <= selectedMaxAge!;
      });
    }

    switch (sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'newest':     list.sort((a, b) => Number(b.id) - Number(a.id)); break;
      default: break;
    }

    return list;
  }, [selectedCategories, maxPrice, selectedMinAge, selectedMaxAge, sort]);

  const categoryNames = Object.fromEntries(
    FALLBACK_CATEGORIES.map((c) => [c.slug, c.name])
  );

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">

      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-chewy text-[2rem] text-brand-indigo">
            All Products
          </h1>
          <p className="text-[0.88rem] text-brand-ink-soft">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-[10px] border border-brand-line bg-white px-4 py-2 text-[0.88rem] text-brand-ink outline-none focus:border-brand-indigo"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Active filter pills ── */}
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

      {/* ── Main layout ── */}
      <div className="flex gap-8 items-start">

        {/* Sidebar */}
        <FilterSidebar
          categories={FALLBACK_CATEGORIES}
          selectedCategories={selectedCategories}
          maxPrice={maxPrice}
          selectedMinAge={selectedMinAge}
          selectedMaxAge={selectedMaxAge}
          onCategoryChange={handleCategoryChange}
          onMaxPriceChange={handleMaxPriceChange}
          onAgeChange={handleAgeChange}
        />

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="mb-4 text-5xl">🔍</span>
              <h3 className="font-chewy text-[1.4rem] text-brand-indigo mb-2">
                No products found
              </h3>
              <p className="text-[0.9rem] text-brand-ink-soft mb-6">
                Try adjusting or clearing your filters.
              </p>
              <button
                onClick={handleClearAll}
                className="rounded-[12px] bg-brand-indigo px-6 py-3 text-[0.9rem] font-bold text-white hover:bg-brand-indigo-soft"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}