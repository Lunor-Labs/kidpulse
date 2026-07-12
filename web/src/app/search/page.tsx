import Link from 'next/link';
import { ProductCard } from '@/components/features/home/ProductCard';
import { searchProducts, getProducts, ApiUnavailableError } from '@/lib/api';
import type { Product, ProductSuggestion } from '@/types/catalog';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} — KidPulse` : 'Search — KidPulse',
    description: q
      ? `Search results for “${q}” on KidPulse.`
      : 'Search KidPulse for creative kits and learning toys.',
  };
}

function suggestionToProduct(s: ProductSuggestion): Product {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: '',
    price: s.price,
    compareAtPrice: null,
    sku: '',
    stockQuantity: 1,
    ageRangeMin: null,
    ageRangeMax: null,
    isFeatured: false,
    isBestSeller: false,
    category: { id: '', name: s.categoryName, slug: '' },
    images: s.imageUrl
      ? [{ id: s.id, url: s.imageUrl, altText: s.name, sortOrder: 0 }]
      : [],
  };
}

async function loadResults(q: string): Promise<Product[]> {
  try {
    const suggestions = await searchProducts(q, 20);
    if (suggestions.length === 0) return [];
    return suggestions.map(suggestionToProduct);
  } catch (error) {
    if (error instanceof ApiUnavailableError) return [];
    throw error;
  }
}

async function loadSuggestedPicks(): Promise<Product[]> {
  try {
    return await getProducts({ sort: 'featured', limit: 8 });
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <h1 className="mb-4 font-chewy text-[2rem] text-brand-indigo">Search KidPulse</h1>
        <p className="mb-6 text-brand-ink-soft">
          Start typing in the search bar above to find painting kits, STEM toys, and gifts.
        </p>
        <Link
          href="/products"
          className="inline-block rounded-[12px] bg-brand-indigo px-6 py-3 text-[0.9rem] font-bold text-white hover:bg-brand-indigo-soft"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  const results = await loadResults(query);
  const picks = results.length === 0 ? await loadSuggestedPicks() : [];

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">
      <div className="mb-6">
        <h1 className="font-chewy text-[2rem] text-brand-indigo">
          Results for “{query}”
        </h1>
        <p className="text-[0.88rem] text-brand-ink-soft">
          {results.length} product{results.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-8 rounded-[16px] border border-brand-line bg-white p-8 text-center">
            <span className="mb-3 block text-5xl">🔎</span>
            <h2 className="mb-1 font-chewy text-[1.4rem] text-brand-indigo">
              We couldn’t find a match
            </h2>
            <p className="text-[0.92rem] text-brand-ink-soft">
              Try a different keyword, or browse all products.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-block rounded-[12px] bg-brand-indigo px-6 py-3 text-[0.9rem] font-bold text-white hover:bg-brand-indigo-soft"
            >
              Browse all products
            </Link>
          </div>

          {picks.length > 0 && (
            <div>
              <h3 className="mb-4 font-chewy text-[1.3rem] text-brand-indigo">
                You may still like
              </h3>
              <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
                {picks.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
