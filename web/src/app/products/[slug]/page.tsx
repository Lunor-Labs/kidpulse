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

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 flex items-center gap-2 text-[0.82rem] text-brand-ink-soft">
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
