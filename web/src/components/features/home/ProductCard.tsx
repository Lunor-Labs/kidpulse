import Image from 'next/image';
import { AddToCartButton } from '@/components/features/cart/AddToCartButton';
import { Badge } from '@/components/ui/Badge';
import { PriceTag } from '@/components/ui/PriceTag';
import type { Product } from '@/types/catalog';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-square bg-brand-cream">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl" aria-hidden>🎨</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-brand-ink-soft">{product.category.name}</span>
          {product.ageRangeMin != null && product.ageRangeMax != null && (
            <Badge tone="sky">{`Ages ${product.ageRangeMin}–${product.ageRangeMax}`}</Badge>
          )}
        </div>
        <h3 className="line-clamp-2 font-semibold text-brand-ink">{product.name}</h3>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
        <div className="mt-auto pt-2">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
