import Link from 'next/link';
import { getBestSellers } from '@/lib/api';
import type { Product } from '@/types/catalog';
import { ProductCard } from './ProductCard';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'DIY 3D Character Painting Kit',
    slug: 'diy-3d-character-painting-kit',
    description: '',
    price: 2500,
    compareAtPrice: 12690,
    sku: 'PK-001',
    stockQuantity: 50,
    ageRangeMin: 5,
    ageRangeMax: 12,
    isFeatured: true,
    isBestSeller: true,
    category: { id: '1', name: 'Painting Kits', slug: 'painting-kits' },
    images: [],
  },
  {
    id: '2',
    name: 'KidPulse STEM Science Kit',
    slug: 'kidpulse-stem-science-kit',
    description: '',
    price: 5100,
    compareAtPrice: 8500,
    sku: 'SK-001',
    stockQuantity: 30,
    ageRangeMin: 6,
    ageRangeMax: 12,
    isFeatured: true,
    isBestSeller: true,
    category: { id: '2', name: 'STEM Kits', slug: 'stem-kits' },
    images: [],
  },
  {
    id: '3',
    name: 'Custom Return Gift Set',
    slug: 'custom-return-gift-set',
    description: '',
    price: 4200,
    compareAtPrice: null,
    sku: 'GC-001',
    stockQuantity: 20,
    ageRangeMin: null,
    ageRangeMax: null,
    isFeatured: false,
    isBestSeller: true,
    category: { id: '3', name: 'Gift Collections', slug: 'gift-collections' },
    images: [],
  },
  {
    id: '4',
    name: 'Sea Theme Painting Kit',
    slug: 'sea-theme-painting-kit',
    description: '',
    price: 3890,
    compareAtPrice: null,
    sku: 'PK-002',
    stockQuantity: 40,
    ageRangeMin: 4,
    ageRangeMax: 10,
    isFeatured: false,
    isBestSeller: true,
    category: { id: '1', name: 'Painting Kits', slug: 'painting-kits' },
    images: [],
  },
  {
    id: '5',
    name: 'Animal World Learning Set',
    slug: 'animal-world-learning-set',
    description: '',
    price: 5062,
    compareAtPrice: 6750,
    sku: 'LT-001',
    stockQuantity: 25,
    ageRangeMin: 3,
    ageRangeMax: 10,
    isFeatured: false,
    isBestSeller: true,
    category: { id: '4', name: 'Learning Toys', slug: 'learning-toys' },
    images: [],
  },
];

export async function BestSellers() {
  let products: Product[] = [];
  try {
    products = await getBestSellers();
  } catch {
    products = FALLBACK_PRODUCTS;
  }
  if (products.length === 0) products = FALLBACK_PRODUCTS;

  return (
    <section className="mx-auto max-w-7xl px-5 py-0 pb-[60px] sm:px-8">

      {/* Section header */}
      <div className="mb-[30px] flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="mb-[6px] block font-display text-[0.95rem] font-normal tracking-[0.04em] text-brand-berry">
            Loved by families
          </span>
          <h2 className="font-display text-[2.1rem] font-normal text-brand-indigo">
            Best Selling Products
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-[6px] border-b-2 border-brand-gold pb-[3px] text-[0.9rem] font-bold text-brand-indigo hover:text-brand-berry"
        >
          View all →
        </Link>
      </div>

      {/* Product grid — 5 columns matching the design */}
      <div className="grid grid-cols-2 gap-[18px] md:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 5).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}