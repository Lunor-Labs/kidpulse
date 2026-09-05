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

  /**
   * A soft-deleted row keeps its slug, and the unique index does not care that
   * the row is deleted — so the slug stays taken by a row that findBySlug()
   * deliberately cannot see. Renaming it out of the way is what lets an admin
   * delete a category and add another under the same name.
   *
   * Suffixed with the row id, which is unique by definition, so this can never
   * collide with a live slug or with another released one.
   */
  async releaseSlug(id: string, slug: string) {
    return prisma.category.update({
      where: { id },
      data: { slug: `${slug}__deleted__${id}` },
    });
  }

  async findDeletedBySlug(slug: string) {
    return prisma.category.findFirst({
      where: { slug, deletedAt: { not: null } },
    });
  }

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
