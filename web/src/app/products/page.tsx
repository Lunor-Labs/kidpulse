import { Suspense } from 'react';
import { ProductsClient } from '@/components/features/products/ProductsClient';

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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const categories = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];

  return (
    <Suspense fallback={null}>
      <ProductsClient
        initialCategories={categories}
        initialMaxPrice={params.maxPrice ? Number(params.maxPrice) : 15000}
        initialMinAge={params.minAge ? Number(params.minAge) : null}
        initialMaxAge={params.maxAge ? Number(params.maxAge) : null}
        initialSort={params.sort ?? 'featured'}
        initialQuery={params.q ?? ''}
      />
    </Suspense>
  );
}