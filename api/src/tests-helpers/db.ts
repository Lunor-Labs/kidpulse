import { prisma } from '../lib/prisma';

export async function resetDb(): Promise<void> {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.autoDiscount.deleteMany();
  await prisma.productBanner.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

let n = 0;

export async function createCategory(
  data: Partial<{ name: string; slug: string; sortOrder: number; isActive: boolean }> = {}
) {
  n += 1;
  return prisma.category.create({
    data: { name: `Cat ${n}`, slug: `cat-${n}`, sortOrder: n, ...data },
  });
}

export async function createProduct(
  categoryId: string,
  data: Partial<{
    name: string;
    slug: string;
    sku: string;
    price: number;
    compareAtPrice: number;
    isBestSeller: boolean;
    isFeatured: boolean;
    isActive: boolean;
    stockQuantity: number;
    ageRangeMin: number;
    ageRangeMax: number;
  }> = {}
) {
  n += 1;
  return prisma.product.create({
    data: {
      name: `Product ${n}`,
      slug: `product-${n}`,
      sku: `SKU-${n}`,
      description: 'Test product',
      price: 1000,
      stockQuantity: 10,
      categoryId,
      ...data,
    },
  });
}
