import Link from 'next/link';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types/catalog';

const CATEGORY_EMOJI: Record<string, string> = {
  'painting-kits': '🎨',
  'stem-kits': '🧪',
  'gift-collections': '🎁',
  'learning-toys': '🧸',
};

export async function CategoryCards() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    return null;
  }
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((c) => {
          const comingSoon = c.productCount === 0;
          return (
            <Link
              key={c.id}
              href={comingSoon ? '#' : `/products?category=${c.slug}`}
              aria-disabled={comingSoon}
              className="group rounded-2xl border border-brand-line bg-white p-5 transition-shadow hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden>{CATEGORY_EMOJI[c.slug] ?? '⭐'}</span>
              <h3 className="mt-3 font-display font-bold text-brand-indigo">{c.name}</h3>
              <p className="mt-1 text-sm text-brand-ink-soft">
                {comingSoon ? 'Coming Soon' : `${c.productCount} products`}
                {!comingSoon && <span className="ml-1 text-brand-berry transition-transform group-hover:translate-x-0.5">→</span>}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
