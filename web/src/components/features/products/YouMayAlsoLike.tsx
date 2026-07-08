import Link from 'next/link';
import type { Product } from '@/types/catalog';

const EMOJI: Record<string, string> = {
  'painting-kits':    '🖌️',
  'stem-kits':        '🧪',
  'gift-collections': '🎁',
  'learning-toys':    '🦁',
};

const BG: Record<string, string> = {
  'painting-kits':    'bg-[#fff4e0]',
  'stem-kits':        'bg-[#e7f6ff]',
  'gift-collections': 'bg-[#fde9f0]',
  'learning-toys':    'bg-[#eef8e1]',
};

function formatPrice(p: number) {
  return `Rs. ${p.toLocaleString('en-LK')}`;
}

interface YouMayAlsoLikeProps {
  products: Product[];
}

export function YouMayAlsoLike({ products }: YouMayAlsoLikeProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-brand-line pt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="mb-1 block font-chewy text-[0.95rem] tracking-[0.04em] text-brand-berry">
            Explore more
          </span>
          <h2 className="font-chewy text-[1.8rem] text-brand-indigo">
            You may also like
          </h2>
        </div>
        <Link
          href="/products"
          className="border-b-2 border-brand-gold pb-[2px] text-[0.88rem] font-bold text-brand-indigo hover:text-brand-berry"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => {
          const slug = p.category.slug;
          const emoji = EMOJI[slug] ?? '🎨';
          const bg = BG[slug] ?? 'bg-brand-cream';
          const hasDiscount = p.compareAtPrice && p.compareAtPrice > p.price;

          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group overflow-hidden rounded-[16px] border border-brand-line bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(27,11,128,0.12)]"
            >
              <div className={`flex h-[140px] items-center justify-center text-[48px] ${bg}`}>
                {emoji}
              </div>
              <div className="p-3">
                <div className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.04em] text-brand-sky-deep">
                  {p.category.name}
                </div>
                <h3 className="mb-2 text-[0.86rem] font-bold leading-tight text-brand-ink line-clamp-2">
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.95rem] font-bold text-brand-indigo">
                    {formatPrice(p.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[0.74rem] text-brand-ink-soft line-through">
                      {formatPrice(p.compareAtPrice!)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}