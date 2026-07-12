import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { AuthUser } from '../types/express';
import { WishlistItemDto, WishlistToggleResult } from '../types/dto';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProfileService } from './ProfileService';

export class WishlistService {
  constructor(
    private profileService = new ProfileService(),
    private productRepo = new ProductRepository()
  ) {}

  async list(user: AuthUser): Promise<WishlistItemDto[]> {
    await this.profileService.ensureProfile(user);
    try {
      const items = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
              images: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });
      const ratings = await this.productRepo.ratingsFor(items.map((i) => i.productId));
      return items.map((i) => {
        const rating = ratings.get(i.productId) ?? { avg: 0, count: 0 };
        return {
          id: i.id,
          addedAt: i.createdAt.toISOString(),
          product: {
            id: i.product.id,
            name: i.product.name,
            slug: i.product.slug,
            description: i.product.description,
            price: Number(i.product.price),
            compareAtPrice:
              i.product.compareAtPrice === null ? null : Number(i.product.compareAtPrice),
            sku: i.product.sku,
            stockQuantity: i.product.stockQuantity,
            lowStockAlert: i.product.lowStockAlert,
            tags: i.product.tags,
            variants: [],
            ageRangeMin: i.product.ageRangeMin,
            ageRangeMax: i.product.ageRangeMax,
            isFeatured: i.product.isFeatured,
            isBestSeller: i.product.isBestSeller,
            metaTitle: i.product.metaTitle,
            metaDescription: i.product.metaDescription,
            category: i.product.category,
            images: i.product.images.map((img) => ({
              id: img.id,
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder,
            })),
            avgRating: Math.round(rating.avg * 10) / 10,
            reviewCount: rating.count,
          },
        };
      });
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Failed to load wishlist');
      throw new AppError('Unable to load wishlist', 500);
    }
  }

  async toggle(user: AuthUser, productId: string): Promise<WishlistToggleResult> {
    await this.profileService.ensureProfile(user);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found', 404);
    try {
      const existing = await prisma.wishlistItem.findUnique({
        where: { userId_productId: { userId: user.id, productId } },
      });
      if (existing) {
        await prisma.wishlistItem.delete({ where: { id: existing.id } });
        return { productId, inWishlist: false };
      }
      await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
      return { productId, inWishlist: true };
    } catch (error) {
      logger.error({ error, userId: user.id, productId }, 'Failed to toggle wishlist');
      throw new AppError('Unable to update wishlist', 500);
    }
  }

  async ids(user: AuthUser): Promise<string[]> {
    await this.profileService.ensureProfile(user);
    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });
    return items.map((i) => i.productId);
  }
}
