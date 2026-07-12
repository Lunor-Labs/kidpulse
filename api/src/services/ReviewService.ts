import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { ReviewDto, ReviewListDto } from '../types/dto';
import { AuthUser } from '../types/express';
import { ProfileService } from './ProfileService';

export interface ReviewSubmissionInput {
  rating: number;
  title?: string | null;
  body: string;
}

export class ReviewService {
  constructor(
    private reviewRepo = new ReviewRepository(),
    private profileService = new ProfileService()
  ) {}

  async submit(
    user: AuthUser,
    productId: string,
    input: ReviewSubmissionInput
  ): Promise<ReviewDto> {
    const profile = await this.profileService.ensureProfile(user);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found', 404);
    const authorName = profile.fullName?.trim() || (profile.email ? profile.email.split('@')[0] : 'Customer');
    try {
      const review = await prisma.review.upsert({
        where: { productId_userId: { productId, userId: user.id } },
        create: {
          productId,
          userId: user.id,
          authorName,
          rating: input.rating,
          title: input.title ?? null,
          body: input.body,
        },
        update: {
          rating: input.rating,
          title: input.title ?? null,
          body: input.body,
          authorName,
        },
      });
      return {
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        authorName: review.authorName,
        createdAt: review.createdAt.toISOString(),
      };
    } catch (error) {
      logger.error({ error, userId: user.id, productId }, 'Failed to submit review');
      throw new AppError('Unable to submit review', 500);
    }
  }

  async getForProductSlug(slug: string): Promise<ReviewListDto> {
    try {
      const product = await prisma.product.findFirst({
        where: { slug, isActive: true },
        select: { id: true },
      });
      if (!product) throw new AppError('Product not found', 404);
      const [reviews, agg] = await Promise.all([
        this.reviewRepo.findApprovedByProductId(product.id),
        this.reviewRepo.aggregateForProduct(product.id),
      ]);
      return {
        avgRating: Math.round(agg.avgRating * 10) / 10,
        reviewCount: agg.reviewCount,
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          authorName: r.authorName,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, slug }, 'Failed to fetch reviews');
      throw new AppError('Unable to load reviews', 500);
    }
  }
}
