'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { ImageGallery } from '@/components/features/products/ImageGallery';
import { VariantSelector } from '@/components/features/products/VariantSelector';
import { QuantitySelector } from '@/components/features/products/QuantitySelector';
import { AdBanner } from '@/components/features/products/AdBanner';
import { TrustBadges } from '@/components/features/products/TrustBadges';
import { YouMayAlsoLike } from '@/components/features/products/YouMayAlsoLike';
import type { Product, Variant } from '@/types/catalog';

/* ── Fallback product data ── */
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: '1', name: 'DIY 3D Character Painting Kit', slug: 'diy-3d-character-painting-kit',
    description: 'Everything your child needs to paint their favourite characters in 3D. Includes pre-outlined canvases, child-safe acrylic paints, brushes, and an easel stand. No experience needed — just imagination! Perfect for kids aged 5–12 who love creative play.',
    price: 2500, compareAtPrice: 12690, sku: 'PK-001', stockQuantity: 50,
    ageRangeMin: 5, ageRangeMax: 12, isFeatured: true, isBestSeller: true,
    category: { id: '1', name: 'Painting Kits', slug: 'painting-kits' },
    images: [],
    variants: [
      { id: 'v1', label: 'Ages 3–6',  ageRangeMin: 3, ageRangeMax: 6,  price: 2500, compareAtPrice: 12690, stockQuantity: 20, sku: 'PK-001-A' },
      { id: 'v2', label: 'Ages 6–9',  ageRangeMin: 6, ageRangeMax: 9,  price: 2500, compareAtPrice: 12690, stockQuantity: 18, sku: 'PK-001-B' },
      { id: 'v3', label: 'Ages 9–12', ageRangeMin: 9, ageRangeMax: 12, price: 2800, compareAtPrice: 12690, stockQuantity: 0,  sku: 'PK-001-C' },
    ],
  },
  {
    id: '2', name: 'KidPulse STEM Science Kit', slug: 'kidpulse-stem-science-kit',
    description: 'A hands-on science kit packed with 20+ experiments. Teaches chemistry, physics, and biology concepts through fun, guided activities. Comes with all materials, an experiment guide book, and safety goggles.',
    price: 5100, compareAtPrice: 8500, sku: 'SK-001', stockQuantity: 30,
    ageRangeMin: 6, ageRangeMax: 12, isFeatured: true, isBestSeller: true,
    category: { id: '2', name: 'STEM Kits', slug: 'stem-kits' },
    images: [],
    variants: [
      { id: 'v4', label: 'Ages 6–9',  ageRangeMin: 6, ageRangeMax: 9,  price: 5100, compareAtPrice: 8500, stockQuantity: 15, sku: 'SK-001-A' },
      { id: 'v5', label: 'Ages 9–12', ageRangeMin: 9, ageRangeMax: 12, price: 5500, compareAtPrice: 8500, stockQuantity: 15, sku: 'SK-001-B' },
    ],
  },
  {
    id: '3', name: 'Custom Return Gift Set', slug: 'custom-return-gift-set',
    description: 'The perfect birthday return gift. Customisable sets that every child will love. Each set includes a mini painting kit, a small toy, and a personalised card. Available in bulk for parties.',
    price: 4200, compareAtPrice: null, sku: 'GC-001', stockQuantity: 20,
    ageRangeMin: null, ageRangeMax: null, isFeatured: false, isBestSeller: true,
    category: { id: '3', name: 'Gift Collections', slug: 'gift-collections' },
    images: [], variants: [],
  },
  {
    id: '4', name: 'Sea Theme Painting Kit', slug: 'sea-theme-painting-kit',
    description: 'Dive into the ocean world with this sea-themed painting kit. Features underwater characters, ocean backgrounds, and pearlescent paints for a magical finish.',
    price: 3890, compareAtPrice: null, sku: 'PK-002', stockQuantity: 40,
    ageRangeMin: 4, ageRangeMax: 10, isFeatured: false, isBestSeller: true,
    category: { id: '1', name: 'Painting Kits', slug: 'painting-kits' },
    images: [],
    variants: [
      { id: 'v6', label: 'Ages 4–7',  ageRangeMin: 4, ageRangeMax: 7,  price: 3890, compareAtPrice: null, stockQuantity: 25, sku: 'PK-002-A' },
      { id: 'v7', label: 'Ages 7–10', ageRangeMin: 7, ageRangeMax: 10, price: 3890, compareAtPrice: null, stockQuantity: 15, sku: 'PK-002-B' },
    ],
  },
  {
    id: '5', name: 'Animal World Learning Set', slug: 'animal-world-learning-set',
    description: 'Explore the animal kingdom with this interactive learning set. Includes 50+ animal figurines, habitat cards, and a fact book. Encourages curiosity and vocabulary development.',
    price: 5062, compareAtPrice: 6750, sku: 'LT-001', stockQuantity: 25,
    ageRangeMin: 3, ageRangeMax: 10, isFeatured: false, isBestSeller: true,
    category: { id: '4', name: 'Learning Toys', slug: 'learning-toys' },
    images: [], variants: [],
  },
  {
    id: '6', name: 'Junior Microscope Explorer Kit', slug: 'junior-microscope-kit',
    description: 'A real working microscope for kids! Comes with 10 prepared slides, blank slides, tweezers, and a full-colour guide to the microscopic world.',
    price: 6200, compareAtPrice: null, sku: 'SK-002', stockQuantity: 18,
    ageRangeMin: 8, ageRangeMax: 12, isFeatured: false, isBestSeller: false,
    category: { id: '2', name: 'STEM Kits', slug: 'stem-kits' },
    images: [], variants: [],
  },
  {
    id: '7', name: 'Dinosaur Painting Kit', slug: 'dinosaur-painting-kit',
    description: 'Roar into creativity with our dinosaur-themed painting kit. Features 6 dinosaur canvases, vibrant paints, and fun dino facts on every canvas.',
    price: 2900, compareAtPrice: 4500, sku: 'PK-003', stockQuantity: 35,
    ageRangeMin: 4, ageRangeMax: 9, isFeatured: false, isBestSeller: false,
    category: { id: '1', name: 'Painting Kits', slug: 'painting-kits' },
    images: [], variants: [],
  },
  {
    id: '8', name: 'Rainbow Slime Science Kit', slug: 'rainbow-slime-kit',
    description: 'Make 10 different types of slime! Includes all ingredients, mixing tools, storage containers, and a step-by-step recipe book. Mess-friendly and child-safe.',
    price: 3400, compareAtPrice: null, sku: 'SK-003', stockQuantity: 22,
    ageRangeMin: 6, ageRangeMax: 12, isFeatured: false, isBestSeller: false,
    category: { id: '2', name: 'STEM Kits', slug: 'stem-kits' },
    images: [], variants: [],
  },
  {
    id: '9', name: 'Birthday Gift Box Deluxe', slug: 'birthday-gift-box-deluxe',
    description: 'The ultimate birthday gift box curated for kids. Includes a painting kit, a STEM activity, chocolates, and a personalised birthday card. Gift-wrapped and ready to deliver.',
    price: 7500, compareAtPrice: 9800, sku: 'GC-002', stockQuantity: 12,
    ageRangeMin: null, ageRangeMax: null, isFeatured: false, isBestSeller: false,
    category: { id: '3', name: 'Gift Collections', slug: 'gift-collections' },
    images: [], variants: [],
  },
];

function discountPercent(price: number, compareAt: number) {
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function formatPrice(p: number) {
  return `Rs. ${p.toLocaleString('en-LK')}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];

  const product = useMemo(
    () => FALLBACK_PRODUCTS.find((p) => p.slug === slug),
    [slug]
  );

  const related = useMemo(
    () => product
      ? FALLBACK_PRODUCTS.filter(
          (p) => p.category.slug === product.category.slug && p.slug !== slug
        ).slice(0, 4)
      : [],
    [product, slug]
  );

  const addItem = useCartStore((s) => s.addItem);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product?.variants?.[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) return notFound();

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;

  const activePrice       = selectedVariant?.price       ?? product.price;
  const activeCompareAt   = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const activeStock       = selectedVariant?.stockQuantity  ?? product.stockQuantity;
  const isOutOfStock      = activeStock === 0;
  const pct               = activeCompareAt ? discountPercent(activePrice, activeCompareAt) : null;

  const handleAddToCart = () => {
    addItem({
      productId: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant
        ? `${product.name} (${selectedVariant.label})`
        : product.name,
      price: activePrice,
      imageUrl: product.images[0]?.url ?? null,
    });
    toast.success(`${product.name} added to cart!`);
    setQuantity(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">

      {/* Breadcrumb */}
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

      {/* ── Main 3-col grid ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr_220px]">

        {/* LEFT — Image gallery */}
        <ImageGallery
          images={product.images}
          productName={product.name}
          categorySlug={product.category.slug}
        />

        {/* MIDDLE — Product info */}
        <div>
          <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-brand-sky-deep">
            {product.category.name}
          </div>

          <h1 className="mb-3 font-chewy text-[1.9rem] leading-tight text-brand-indigo">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[0.9rem] tracking-[1px] text-brand-gold-deep">★★★★★</span>
            <span className="text-[0.82rem] text-brand-ink-soft">5.0 · 386 reviews</span>
          </div>

          {/* Price */}
          <div className="mb-2 flex items-baseline gap-3">
            <span className="text-[1.6rem] font-bold text-brand-indigo">
              {formatPrice(activePrice)}
            </span>
            {activeCompareAt && (
              <span className="text-[0.95rem] text-brand-ink-soft line-through">
                {formatPrice(activeCompareAt)}
              </span>
            )}
            {pct && (
              <span className="rounded-full bg-brand-berry px-[10px] py-[3px] text-[0.74rem] font-bold text-white">
                Save {pct}%
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mb-5">
            {isOutOfStock ? (
              <span className="text-[0.84rem] font-bold text-brand-berry">
                ✕ Out of stock
              </span>
            ) : (
              <span className="text-[0.84rem] font-bold text-brand-olive">
                ✔ In stock
                {activeStock <= 10 && (
                  <span className="ml-2 text-brand-berry">
                    · Only {activeStock} left!
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Variant selector */}
          {hasVariants && (
            <VariantSelector
              variants={variants}
              selectedVariantId={selectedVariant?.id ?? null}
              onSelect={(v) => {
                setSelectedVariant(v);
                setQuantity(1);
              }}
            />
          )}

          {/* Quantity selector */}
          {!isOutOfStock && (
            <QuantitySelector
              quantity={quantity}
              maxQuantity={Math.min(activeStock, 10)}
              onChange={setQuantity}
            />
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="mb-3 w-full rounded-[14px] bg-brand-indigo py-4 text-[1rem] font-bold text-white transition-colors hover:bg-brand-indigo-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOutOfStock ? '✕ Out of Stock' : '🛒 Add to Cart'}
          </button>

          <button className="w-full rounded-[14px] border-2 border-brand-line bg-white py-3 text-[0.95rem] font-bold text-brand-indigo transition-colors hover:border-brand-indigo">
            ♡ Add to Wishlist
          </button>

          {/* Description */}
          <div className="mt-6 border-t border-brand-line pt-5">
            <h2 className="mb-3 font-chewy text-[1.1rem] text-brand-indigo">
              About this kit
            </h2>
            <p className="text-[0.92rem] leading-relaxed text-brand-ink-soft">
              {product.description}
            </p>
          </div>

          {/* Age range info */}
          {product.ageRangeMin && product.ageRangeMax && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-brand-cream px-4 py-2 text-[0.82rem] font-semibold text-brand-indigo">
              👶 Recommended for ages {product.ageRangeMin}–{product.ageRangeMax}
            </div>
          )}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="flex flex-col gap-4">
          <AdBanner />
          <TrustBadges />
        </div>
      </div>

      {/* You may also like */}
      <YouMayAlsoLike products={related} />
    </div>
  );
}