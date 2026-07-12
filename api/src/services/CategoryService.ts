import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { AdminCategoryDto, CategoryDto } from '../types/dto';
import { CategoryUpsertInput } from '../types/adminSchemas';

type AdminCategoryRow = Awaited<ReturnType<CategoryRepository['findAllForAdmin']>>[number];

function toAdminDto(c: AdminCategoryRow): AdminCategoryDto {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
    isActive: c.isActive,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export class CategoryService {
  constructor(private categoryRepo = new CategoryRepository()) {}

  async getCategories(): Promise<CategoryDto[]> {
    const start = Date.now();
    try {
      const categories = await this.categoryRepo.findActiveWithCounts();
      logger.info({ count: categories.length, ms: Date.now() - start }, 'Categories fetched');
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
        productCount: c._count.products,
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch categories');
      throw new AppError('Unable to load categories', 500);
    }
  }

  async listForAdmin(): Promise<AdminCategoryDto[]> {
    const rows = await this.categoryRepo.findAllForAdmin();
    return rows.map(toAdminDto);
  }

  async getForAdmin(id: string): Promise<AdminCategoryDto> {
    const row = await this.categoryRepo.findById(id);
    if (!row) throw new AppError('Category not found', 404);
    const rows = await this.categoryRepo.findAllForAdmin();
    const withCount = rows.find((r) => r.id === id);
    if (!withCount) throw new AppError('Category not found', 404);
    return toAdminDto(withCount);
  }

  async create(input: CategoryUpsertInput): Promise<AdminCategoryDto> {
    const dupe = await this.categoryRepo.findBySlug(input.slug);
    if (dupe) throw new AppError('A category with this slug already exists', 409);
    const created = await this.categoryRepo.create({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
    });
    return this.getForAdmin(created.id);
  }

  async update(id: string, input: CategoryUpsertInput): Promise<AdminCategoryDto> {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) throw new AppError('Category not found', 404);
    if (input.slug !== existing.slug) {
      const dupe = await this.categoryRepo.findBySlug(input.slug);
      if (dupe && dupe.id !== id) {
        throw new AppError('A category with this slug already exists', 409);
      }
    }
    await this.categoryRepo.update(id, {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      isActive: input.isActive ?? existing.isActive,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
    });
    return this.getForAdmin(id);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) throw new AppError('Category not found', 404);
    await this.categoryRepo.softDelete(id);
  }
}
