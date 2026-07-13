import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class CategoryRepository {
  async findActiveWithCounts() {
    return prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
    });
  }

  async findAllForAdmin() {
    return prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findFirst({
      where: { slug, deletedAt: null },
    });
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
