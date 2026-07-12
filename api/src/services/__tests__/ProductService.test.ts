import { Prisma } from '@prisma/client';
import { ProductService } from '../ProductService';
import { productListQuerySchema } from '../../types/productQuery';

const row = {
  id: 'p1',
  name: 'Kit',
  slug: 'kit',
  description: 'd',
  price: new Prisma.Decimal(2500),
  compareAtPrice: new Prisma.Decimal(12690),
  sku: 'SKU-1',
  stockQuantity: 5,
  lowStockAlert: 5,
  tags: [] as string[],
  ageRangeMin: 3,
  ageRangeMax: 10,
  isFeatured: false,
  isBestSeller: true,
  isActive: true,
  categoryId: 'c1',
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { id: 'c1', name: 'Painting Kits', slug: 'painting-kits' },
  images: [],
  variants: [],
};

describe('ProductService.getProducts', () => {
  it('converts Decimal prices to numbers', async () => {
    const repo = {
      findMany: jest.fn().mockResolvedValue([row]),
      ratingsFor: jest.fn().mockResolvedValue(new Map()),
    };
    const service = new ProductService(repo as never);
    const result = await service.getProducts(productListQuerySchema.parse({}));
    expect(result[0].price).toBe(2500);
    expect(result[0].compareAtPrice).toBe(12690);
  });

  it('includes avgRating and reviewCount when present', async () => {
    const ratings = new Map([['p1', { avg: 4.5, count: 12 }]]);
    const repo = {
      findMany: jest.fn().mockResolvedValue([row]),
      ratingsFor: jest.fn().mockResolvedValue(ratings),
    };
    const service = new ProductService(repo as never);
    const result = await service.getProducts(productListQuerySchema.parse({}));
    expect(result[0].avgRating).toBe(4.5);
    expect(result[0].reviewCount).toBe(12);
  });
});
