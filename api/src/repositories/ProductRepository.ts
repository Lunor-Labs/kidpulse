import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ProductListQuery } from '../types/productQuery';

export class ProductRepository {
  async findMany(query: ProductListQuery) {
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (query.bestseller !== undefined) where.isBestSeller = query.bestseller;
    if (query.featured !== undefined) where.isFeatured = query.featured;
    if (query.categoryId) where.categoryId = query.categoryId;

    return prisma.product.findMany({
      where,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }
}
