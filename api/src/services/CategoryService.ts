import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CategoryDto } from '../types/dto';

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
}
