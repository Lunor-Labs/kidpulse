import { prisma } from '../lib/prisma';

export class CategoryRepository {
  async findActiveWithCounts() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
  }
}
