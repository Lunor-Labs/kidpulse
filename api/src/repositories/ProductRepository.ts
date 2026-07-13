import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ProductListQuery, ProductSearchQuery } from '../types/productQuery';

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.ProductInclude;

export interface VariantWriteInput {
  id?: string | null;
  label: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

async function syncProductStockFromVariants(
  tx: Prisma.TransactionClient,
  productId: string
): Promise<void> {
  const agg = await tx.productVariant.aggregate({
    where: { productId, deletedAt: null, isActive: true },
    _sum: { stockQuantity: true },
    _count: { _all: true },
  });
  if (agg._count._all === 0) return;
  await tx.product.update({
    where: { id: productId },
    data: { stockQuantity: agg._sum.stockQuantity ?? 0 },
  });
}

function orderByFor(sort: ProductListQuery['sort']): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' };
    case 'price-desc':
      return { price: 'desc' };
    case 'newest':
      return { createdAt: 'desc' };
    case 'featured':
    default:
      return { isFeatured: 'desc' };
  }
}

export class ProductRepository {
  async findMany(query: ProductListQuery) {
    const where: Prisma.ProductWhereInput = { isActive: true, deletedAt: null };
    if (query.bestseller !== undefined) where.isBestSeller = query.bestseller;
    if (query.featured !== undefined) where.isFeatured = query.featured;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.category && query.category.length > 0) {
      where.category = { slug: { in: query.category } };
    }
    if (query.exclude) {
      where.slug = { not: query.exclude };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }
    if (query.minAge !== undefined) {
      where.OR = [
        { ageRangeMax: { gte: query.minAge } },
        { ageRangeMax: null },
      ];
    }
    if (query.maxAge !== undefined) {
      const ageMaxClause: Prisma.ProductWhereInput = {
        OR: [{ ageRangeMin: { lte: query.maxAge } }, { ageRangeMin: null }],
      };
      where.AND = where.AND ? [...(Array.isArray(where.AND) ? where.AND : [where.AND]), ageMaxClause] : [ageMaxClause];
    }

    return prisma.product.findMany({
      where,
      take: query.limit,
      orderBy: orderByFor(query.sort),
      include: productInclude,
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: productInclude,
    });
  }

  async search(query: ProductSearchQuery) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { description: { contains: query.q, mode: 'insensitive' } },
          { category: { name: { contains: query.q, mode: 'insensitive' } } },
          { tags: { has: query.q.trim().toLowerCase() } },
        ],
      },
      take: query.limit,
      orderBy: [{ isBestSeller: 'desc' }, { isFeatured: 'desc' }],
      include: productInclude,
    });
  }

  async findAllForAdmin() {
    return prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    });
  }

  async findByIdForAdmin(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
  }

  async findBySkuOrSlug(sku: string, slug: string) {
    return prisma.product.findFirst({
      where: {
        deletedAt: null,
        OR: [{ sku }, { slug }],
      },
    });
  }

  async createWithImages(
    data: Prisma.ProductUncheckedCreateInput,
    images: Array<{ url: string; altText: string | null; sortOrder: number }>,
    variants: VariantWriteInput[] = []
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img) => ({
            productId: product.id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder,
          })),
        });
      }
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: product.id,
            label: v.label,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stockQuantity: v.stockQuantity,
            imageUrl: v.imageUrl,
            sortOrder: v.sortOrder,
            isActive: v.isActive,
          })),
        });
        await syncProductStockFromVariants(tx, product.id);
      }
      return product;
    });
  }

  async updateWithImages(
    id: string,
    data: Prisma.ProductUncheckedUpdateInput,
    images: Array<{ url: string; altText: string | null; sortOrder: number }>,
    variants: VariantWriteInput[] = []
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img) => ({
            productId: id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder,
          })),
        });
      }

      const existing = await tx.productVariant.findMany({
        where: { productId: id, deletedAt: null },
        select: { id: true },
      });
      const incomingIds = new Set(
        variants.map((v) => v.id).filter((v): v is string => Boolean(v))
      );
      const toSoftDelete = existing.filter((v) => !incomingIds.has(v.id));
      if (toSoftDelete.length > 0) {
        await tx.productVariant.updateMany({
          where: { id: { in: toSoftDelete.map((v) => v.id) } },
          data: { deletedAt: new Date(), isActive: false },
        });
      }
      for (const v of variants) {
        const payload = {
          label: v.label,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stockQuantity: v.stockQuantity,
          imageUrl: v.imageUrl,
          sortOrder: v.sortOrder,
          isActive: v.isActive,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data: payload });
        } else {
          await tx.productVariant.create({ data: { productId: id, ...payload } });
        }
      }
      await syncProductStockFromVariants(tx, id);
    });
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async dashboardStats() {
    const [activeProducts, activeCategories, stockRows, outOfStock, totalReviews] =
      await Promise.all([
        prisma.product.count({ where: { deletedAt: null, isActive: true } }),
        prisma.category.count({ where: { deletedAt: null, isActive: true } }),
        prisma.product.findMany({
          where: { deletedAt: null, isActive: true, stockQuantity: { gt: 0 } },
          select: { stockQuantity: true, lowStockAlert: true },
        }),
        prisma.product.count({
          where: { deletedAt: null, isActive: true, stockQuantity: 0 },
        }),
        prisma.review.count(),
      ]);
    const lowStock = stockRows.filter((p) => p.stockQuantity <= p.lowStockAlert).length;
    return { activeProducts, activeCategories, lowStock, outOfStock, totalReviews };
  }

  async ratingsFor(productIds: string[]) {
    if (productIds.length === 0) return new Map<string, { avg: number; count: number }>();
    const rows = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds }, isApproved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const map = new Map<string, { avg: number; count: number }>();
    for (const r of rows) {
      map.set(r.productId, {
        avg: r._avg.rating ?? 0,
        count: r._count._all,
      });
    }
    return map;
  }
}
