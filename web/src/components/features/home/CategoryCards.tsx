import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types/catalog';

const CATEGORY_CONFIG: Record<string, {
  emoji: string;
  image: string;
  gradient: string;
}> = {
  'painting-kits': {
    emoji: '🖌️',
    image: '/images/categories/painting-kits.webp',
    gradient: 'linear-gradient(135deg, #ed3f7f, #a0245a)',
  },
  'stem-kits': {
    emoji: '🧪',
    image: '/images/categories/stem-kits.jpg',
    gradient: 'linear-gradient(135deg, #1b0b80, #38b6ff)',
  },
  'gift-collections': {
    emoji: '🎁',
    image: '/images/categories/gift-collections.jpg',
    gradient: 'linear-gradient(135deg, #ffc300, #e8661a)',
  },
  'learning-toys': {
    emoji: '🦁',
    image: '/images/categories/learning-toys.jpg',
    gradient: 'linear-gradient(135deg, #8fb821, #3a7a10)',
  },
};

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Painting Kits',
    slug: 'painting-kits',
    description: null,
    imageUrl: null,
    sortOrder: 1,
    productCount: 24,
  },
  {
    id: '2',
    name: 'STEM Kits',
    slug: 'stem-kits',
    description: null,
    imageUrl: null,
    sortOrder: 2,
    productCount: 18,
  },
  {
    id: '3',
    name: 'Gift Collections',
    slug: 'gift-collections',
    description: null,
    imageUrl: null,
    sortOrder: 3,
    productCount: 0,
  },
  {
    id: '4',
    name: 'Learning Toys',
    slug: 'learning-toys',
    description: null,
    imageUrl: null,
    sortOrder: 4,
    productCount: 0,
  },
];

export async function CategoryCards() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = FALLBACK_CATEGORIES;
  }
  if (categories.length === 0) categories = FALLBACK_CATEGORIES;

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
        {categories.map((c) => {
          const comingSoon = c.productCount === 0;
          const config = CATEGORY_CONFIG[c.slug] ?? {
            emoji: '⭐',
            image: null,
            gradient: 'linear-gradient(135deg, #1b0b80, #38b6ff)',
          };

          return (
            <Link
              key={c.id}
              href={comingSoon ? '#' : `/products?category=${c.slug}`}
              aria-disabled={comingSoon}
              className="group relative flex min-h-[210px] flex-col justify-end overflow-hidden rounded-[20px] shadow-[0_4px_18px_rgba(27,11,128,0.13)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(27,11,128,0.26)]"
              style={{ background: config.gradient }}
            >
              {/* Background image — scales up smoothly on hover */}
              {config.image && (
                <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110">
                  <Image
                    src={config.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Dark gradient overlay — always present, deepens on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,5,50,0.88)] via-[rgba(10,5,50,0.45)] to-[rgba(10,5,50,0.15)] transition-all duration-300 group-hover:from-[rgba(10,5,50,0.92)] group-hover:via-[rgba(10,5,50,0.55)] group-hover:to-[rgba(10,5,50,0.25)]" />

              {/* Content */}
              <div className="relative z-10 flex flex-col p-5">
                <h3 className="mb-1 font-display text-[1.25rem] font-normal text-white drop-shadow-sm">
                  {c.name}
                </h3>
                <p className="mb-3 text-[0.8rem] font-semibold text-white/75">
                  {comingSoon
                    ? 'Coming Soon · Special'
                    : `${c.productCount} products`}
                </p>

                {/* Arrow button — white frosted → gold on hover */}
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/35 bg-white/[0.18] text-base text-white backdrop-blur-sm transition-all duration-300 group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-brand-indigo group-hover:scale-110">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}