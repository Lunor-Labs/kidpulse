import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getBestSellers } from '@/lib/api';
import type { Product } from '@/types/catalog';
import { ProductCard } from './ProductCard';

export async function BestSellers() {
  let products: Product[] = [];
  try {
    products = await getBestSellers();
  } catch {
    return null;
  }
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading
        title="Best Selling Products"
        action={<Link href="/products" className="text-sm font-semibold text-brand-berry hover:text-brand-berry-deep">View all →</Link>}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
