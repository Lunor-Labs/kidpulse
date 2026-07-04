import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/catalog';
import { ProductCard } from '../ProductCard';

const product: Product = {
  id: 'p1',
  name: 'DIY 3D Character Painting Kit — 3 Characters',
  slug: 'character-painting-kit-3',
  description: 'Paint-your-own kit',
  price: 2500,
  compareAtPrice: 12690,
  sku: 'KP-PK-003',
  stockQuantity: 50,
  ageRangeMin: 3,
  ageRangeMax: 10,
  isFeatured: false,
  isBestSeller: true,
  category: { id: 'c1', name: 'Painting Kits', slug: 'painting-kits' },
  images: [{ id: 'i1', url: 'http://127.0.0.1:54321/storage/v1/object/public/product-images/x.jpeg', altText: 'kit', sortOrder: 0 }],
};

describe('ProductCard', () => {
  it('renders name, category, age badge, prices and discount', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText('Painting Kits')).toBeInTheDocument();
    expect(screen.getByText('Ages 3–10')).toBeInTheDocument();
    expect(screen.getByText('Rs. 2,500')).toBeInTheDocument();
    expect(screen.getByText('Rs. 12,690')).toBeInTheDocument();
    expect(screen.getByText('-80%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeEnabled();
  });

  it('omits age badge when age range missing', () => {
    render(<ProductCard product={{ ...product, ageRangeMin: null, ageRangeMax: null }} />);
    expect(screen.queryByText(/Ages/)).not.toBeInTheDocument();
  });
});
