import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProductDto } from '../types/dto';
import { ProductListQuery } from '../types/productQuery';

export class ProductService {
  constructor(private productRepo = new ProductRepository()) {}

  async getProducts(query: ProductListQuery): Promise<ProductDto[]> {
    const start = Date.now();
    try {
      const products = await this.productRepo.findMany(query);
      logger.info({ count: products.length, ms: Date.now() - start }, 'Products fetched');
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice === null ? null : Number(p.compareAtPrice),
        sku: p.sku,
        stockQuantity: p.stockQuantity,
        ageRangeMin: p.ageRangeMin,
        ageRangeMax: p.ageRangeMax,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        category: p.category,
        images: p.images.map((i) => ({
          id: i.id,
          url: i.url,
          altText: i.altText,
          sortOrder: i.sortOrder,
        })),
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch products');
      throw new AppError('Unable to load products', 500);
    }
  }
}
