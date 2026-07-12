import { Suspense } from 'react';
import { ProductsClient } from '@/components/features/products/ProductsClient';
import { getCategories, getProducts, ApiUnavailableError } from '@/lib/api';
import type { Category, Product, ProductListFilters } from '@/types/catalog';

const MAX_PRICE = 15000;

const FALLBACK_PRODUCTS: Product[] = [
  { id:'1', name:'DIY 3D Character Painting Kit', slug:'diy-3d-character-painting-kit', description:'', price:2500, compareAtPrice:12690, sku:'PK-001', stockQuantity:50, ageRangeMin:5, ageRangeMax:12, isFeatured:true, isBestSeller:true, category:{ id:'1', name:'Painting Kits', slug:'painting-kits' }, images:[], avgRating:0, reviewCount:0 },
  { id:'2', name:'KidPulse STEM Science Kit', slug:'kidpulse-stem-science-kit', description:'', price:5100, compareAtPrice:8500, sku:'SK-001', stockQuantity:30, ageRangeMin:6, ageRangeMax:12, isFeatured:true, isBestSeller:true, category:{ id:'2', name:'STEM Kits', slug:'stem-kits' }, images:[], avgRating:0, reviewCount:0 },
  { id:'3', name:'Custom Return Gift Set', slug:'custom-return-gift-set', description:'', price:4200, compareAtPrice:null, sku:'GC-001', stockQuantity:20, ageRangeMin:null, ageRangeMax:null, isFeatured:false, isBestSeller:true, category:{ id:'3', name:'Gift Collections', slug:'gift-collections' }, images:[], avgRating:0, reviewCount:0 },
  { id:'4', name:'Sea Theme Painting Kit', slug:'sea-theme-painting-kit', description:'', price:3890, compareAtPrice:null, sku:'PK-002', stockQuantity:40, ageRangeMin:4, ageRangeMax:10, isFeatured:false, isBestSeller:true, category:{ id:'1', name:'Painting Kits', slug:'painting-kits' }, images:[], avgRating:0, reviewCount:0 },
];

const FALLBACK_CATEGORIES: Category[] = [
  { id:'1', slug:'painting-kits',    name:'Painting Kits',    description:null, imageUrl:null, sortOrder:1, productCount:2 },
  { id:'2', slug:'stem-kits',        name:'STEM Kits',        description:null, imageUrl:null, sortOrder:2, productCount:1 },
  { id:'3', slug:'gift-collections', name:'Gift Collections', description:null, imageUrl:null, sortOrder:3, productCount:1 },
  { id:'4', slug:'learning-toys',    name:'Learning Toys',    description:null, imageUrl:null, sortOrder:4, productCount:0 },
];

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string | string[];
    maxPrice?: string;
    minAge?: string;
    maxAge?: string;
    sort?: string;
    q?: string;
  }>;
}

export const metadata = {
  title: 'All Products — KidPulse',
  description: 'Browse all KidPulse creative kits and learning toys.',
};

type SortValue = NonNullable<ProductListFilters['sort']>;

function parseSort(value: string | undefined): SortValue {
  switch (value) {
    case 'price-asc':
    case 'price-desc':
    case 'newest':
    case 'featured':
      return value;
    default:
      return 'featured';
  }
}

async function loadData(filters: ProductListFilters): Promise<{ products: Product[]; categories: Category[] }> {
  try {
    const [products, categories] = await Promise.all([
      getProducts(filters),
      getCategories(),
    ]);
    return { products, categories };
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return { products: FALLBACK_PRODUCTS, categories: FALLBACK_CATEGORIES };
    }
    throw error;
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const selectedCategories = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];

  const maxPrice = params.maxPrice ? Number(params.maxPrice) : MAX_PRICE;
  const minAge = params.minAge ? Number(params.minAge) : null;
  const maxAge = params.maxAge ? Number(params.maxAge) : null;
  const sort = parseSort(params.sort);

  const filters: ProductListFilters = {
    categories: selectedCategories.length ? selectedCategories : undefined,
    maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
    minAge: minAge ?? undefined,
    maxAge: maxAge ?? undefined,
    sort,
    limit: 48,
  };

  const { products, categories } = await loadData(filters);

  return (
    <Suspense fallback={null}>
      <ProductsClient
        products={products}
        categories={categories}
        initialCategories={selectedCategories}
        initialMaxPrice={maxPrice}
        initialMinAge={minAge}
        initialMaxAge={maxAge}
        initialSort={sort}
        initialQuery={params.q ?? ''}
      />
    </Suspense>
  );
}
