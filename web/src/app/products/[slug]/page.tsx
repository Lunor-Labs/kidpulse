import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/features/products/ImageGallery';
import { AdBanner } from '@/components/features/products/AdBanner';
import { TrustBadges } from '@/components/features/products/TrustBadges';
import { YouMayAlsoLike } from '@/components/features/products/YouMayAlsoLike';
import { ProductDetailClient } from '@/components/features/products/ProductDetailClient';
import { ProductReviews } from '@/components/features/products/ProductReviews';
import {
  getProductBanner,
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
  ApiUnavailableError,
} from '@/lib/api';
import type { Product, ProductBanner, ReviewList } from '@/types/catalog';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    const title = product.metaTitle?.trim() || `${product.name} — KidPulse`;
    const description =
      product.metaDescription?.trim() || product.description.slice(0, 155);
    const ogImage = product.images[0]?.url;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return { title: 'Product — KidPulse' };
  }
}

async function loadPageData(slug: string): Promise<{
  product: Product;
  reviews: ReviewList;
  related: Product[];
  banner: ProductBanner | null;
} | null> {
  try {
    const product = await getProductBySlug(slug);
    const [reviews, related, banner] = await Promise.all([
      getProductReviews(slug).catch(() => ({ avgRating: 0, reviewCount: 0, reviews: [] })),
      getRelatedProducts(product.category.slug, slug).catch(() => []),
      getProductBanner(product.id).catch(() => null),
    ]);
    return { product, reviews, related, banner };
  } catch (error) {
    if (error instanceof ApiUnavailableError) return null;
    throw error;
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await loadPageData(slug);

  if (!data) return notFound();

  const { product, reviews, related, banner } = data;
  const productWithRating: Product = {
    ...product,
    avgRating: reviews.avgRating,
    reviewCount: reviews.reviewCount,
  };

  const site = process.env.SITE_URL ?? 'http://localhost:3000';
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.metaDescription ?? product.description.slice(0, 300),
    sku: product.sku,
    image: product.images.map((img) => img.url),
    brand: { '@type': 'Brand', name: 'KidPulse' },
    category: product.category.name,
    offers: {
      '@type': 'Offer',
      url: `${site}/products/${product.slug}`,
      priceCurrency: 'LKR',
      price: product.price.toFixed(2),
      availability:
        product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };
  if (reviews.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviews.avgRating.toFixed(1),
      reviewCount: reviews.reviewCount,
    };
  }

  // Extract first image from description for left panel
  const firstImageMatch = product.description.match(/<img[^>]+src=["']([^"']+)["']/i);
  const firstImageSrc = firstImageMatch?.[1] ?? product.images[0]?.url ?? null;
  const descriptionWithoutFirstImage = product.description.replace(/<img[^>]+>/i, '');

  return (
    <div className="mx-auto max-w-7xl px-8 py-10 max-[980px]:px-4 max-[980px]:py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 flex items-center gap-2 text-[0.82rem] text-brand-ink-soft max-[980px]:mb-3 max-[980px]:text-[0.75rem]">
        <Link href="/" className="hover:text-brand-indigo">Home</Link>
        <span>›</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-brand-indigo"
        >
          {product.category.name}
        </Link>
        <span>›</span>
        <span className="text-brand-ink">{product.name}</span>
      </nav>

      {/* ── Top 3-column grid ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr_220px]">
        <ImageGallery
          images={product.images}
          productName={product.name}
          categorySlug={product.category.slug}
        />

        <ProductDetailClient product={productWithRating} />

        <div className="flex flex-col gap-4">
          <AdBanner banner={banner} />
          <TrustBadges />
        </div>
      </div>

      {/* ✅ About this kit — full-width separate row below the grid */}
      <div className="mt-8 rounded-[16px] border border-brand-line p-6">
        <h2 className="mb-4 font-chewy text-[1.1rem] text-brand-indigo">About this kit</h2>
        <div className="flex gap-6">

          {/* LEFT — fixed image */}
          <div className="sticky top-[88px] self-start w-[340px] shrink-0">
            {firstImageSrc ? (
              <img
                src={firstImageSrc}
                alt={product.name}
                className="w-full rounded-[12px] object-cover"
              />
            ) : (
              <div className="flex h-[260px] items-center justify-center rounded-[12px] bg-brand-cream text-[3rem]">
                🎨
              </div>
            )}
          </div>

          {/* RIGHT — scrollable description */}
          <div className="max-h-[460px] flex-1 overflow-y-auto pr-2 [scrollbar-width:thin]">
            <div
              className="text-[0.92rem] leading-relaxed text-brand-ink-soft [&_h1]:font-chewy [&_h1]:text-[1.4rem] [&_h1]:text-brand-indigo [&_h1]:mb-2 [&_h2]:font-chewy [&_h2]:text-[1.15rem] [&_h2]:text-brand-indigo [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:text-[1rem] [&_h3]:text-brand-ink [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_strong]:font-semibold [&_em]:italic [&_img]:max-w-full [&_img]:rounded-[12px] [&_img]:my-3"
              dangerouslySetInnerHTML={{ __html: descriptionWithoutFirstImage }}
            />
            {product.ageRangeMin && product.ageRangeMax && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-brand-cream px-4 py-2 text-[0.82rem] font-semibold text-brand-indigo">
                👶 Recommended for ages {product.ageRangeMin}–{product.ageRangeMax}
              </div>
            )}
          </div>

        </div>
      </div>

      <ProductReviews
        productId={product.id}
        avgRating={reviews.avgRating}
        reviewCount={reviews.reviewCount}
        reviews={reviews.reviews}
      />

      <YouMayAlsoLike products={related} />
    </div>
  );
}