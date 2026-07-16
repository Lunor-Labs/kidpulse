import { prisma } from '../lib/prisma';

export class ReviewRepository {
  async findApprovedByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async aggregateForProduct(productId: string) {
    const [agg, count] = await Promise.all([
      prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
      }),
      prisma.review.count({ where: { productId, isApproved: true } }),
    ]);
    return {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: count,
    };
  }
}
