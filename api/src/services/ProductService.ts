import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { ProductRepository } from '../repositories/ProductRepository';
import {
  AdminDashboardStats,
  AdminProductDto,
  ProductDto,
  ProductSuggestionDto,
} from '../types/dto';
import { ProductUpsertInput, VariantInput } from '../types/adminSchemas';
import type { VariantWriteInput } from '../repositories/ProductRepository';
import { ProductListQuery, ProductSearchQuery } from '../types/productQuery';

type ProductRow = Awaited<ReturnType<ProductRepository['findMany']>>[number];

function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

function toDto(
  p: ProductRow,
  ratings: Map<string, { avg: number; count: number }>
): ProductDto {
  const rating = ratings.get(p.id) ?? { avg: 0, count: 0 };
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice === null ? null : Number(p.compareAtPrice),
    sku: p.sku,
    stockQuantity: p.stockQuantity,
    lowStockAlert: p.lowStockAlert,
    tags: p.tags,
    ageRangeMin: p.ageRangeMin,
    ageRangeMax: p.ageRangeMax,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    category: p.category,
    images: p.images.map((i) => ({
      id: i.id,
      url: i.url,
      altText: i.altText,
      sortOrder: i.sortOrder,
    })),
    variants: p.variants
      .filter((v) => v.isActive)
      .map((v) => ({
        id: v.id,
        label: v.label,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice === null ? null : Number(v.compareAtPrice),
        stockQuantity: v.stockQuantity,
        imageUrl: v.imageUrl,
        sortOrder: v.sortOrder,
      })),
    avgRating: Math.round(rating.avg * 10) / 10,
    reviewCount: rating.count,
  };
}

export class ProductService {
  constructor(private productRepo = new ProductRepository()) {}

  async getProducts(query: ProductListQuery): Promise<ProductDto[]> {
    const start = Date.now();
    try {
      const products = await this.productRepo.findMany(query);
      const ratings = await this.productRepo.ratingsFor(products.map((p) => p.id));
      logger.info({ count: products.length, ms: Date.now() - start }, 'Products fetched');
      return products.map((p) => toDto(p, ratings));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch products');
      throw new AppError('Unable to load products', 500);
    }
  }

  async getProductBySlug(slug: string): Promise<ProductDto> {
    try {
      const product = await this.productRepo.findBySlug(slug);
      if (!product) throw new AppError('Product not found', 404);
      const ratings = await this.productRepo.ratingsFor([product.id]);
      return toDto(product, ratings);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, slug }, 'Failed to fetch product by slug');
      throw new AppError('Unable to load product', 500);
    }
  }

  async searchProducts(query: ProductSearchQuery): Promise<ProductSuggestionDto[]> {
    try {
      const products = await this.productRepo.search(query);
      return products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        imageUrl: p.images[0]?.url ?? null,
        categoryName: p.category.name,
      }));
    } catch (error) {
      logger.error({ error, q: query.q }, 'Search failed');
      throw new AppError('Unable to search products', 500);
    }
  }

  async listForAdmin(): Promise<AdminProductDto[]> {
    const rows = await this.productRepo.findAllForAdmin();
    const ratings = await this.productRepo.ratingsFor(rows.map((r) => r.id));
    return rows.map((row) => this.toAdminDto(row, ratings));
  }

  async getForAdmin(id: string): Promise<AdminProductDto> {
    const row = await this.productRepo.findByIdForAdmin(id);
    if (!row) throw new AppError('Product not found', 404);
    const ratings = await this.productRepo.ratingsFor([row.id]);
    return this.toAdminDto(row, ratings);
  }

  async create(input: ProductUpsertInput): Promise<AdminProductDto> {
    this.assertAgeRange(input);
    const dupe = await this.productRepo.findBySkuOrSlug(input.sku, input.slug);
    if (dupe) {
      throw new AppError('A product with this SKU or slug already exists', 409);
    }
    const created = await this.productRepo.createWithImages(
      {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        sku: input.sku,
        stockQuantity: input.stockQuantity,
        lowStockAlert: input.lowStockAlert ?? 5,
        tags: normalizeTags(input.tags),
        ageRangeMin: input.ageRangeMin ?? null,
        ageRangeMax: input.ageRangeMax ?? null,
        isFeatured: input.isFeatured ?? false,
        isBestSeller: input.isBestSeller ?? false,
        isActive: input.isActive ?? true,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        categoryId: input.categoryId,
      },
      input.images.map((img, i) => ({
        url: img.url,
        altText: img.altText ?? null,
        sortOrder: img.sortOrder ?? i,
      })),
      input.variants.map((v, i) => this.toVariantWrite(v, i))
    );
    return this.getForAdmin(created.id);
  }

  async update(id: string, input: ProductUpsertInput): Promise<AdminProductDto> {
    this.assertAgeRange(input);
    const existing = await this.productRepo.findByIdForAdmin(id);
    if (!existing) throw new AppError('Product not found', 404);
    if (input.sku !== existing.sku || input.slug !== existing.slug) {
      const dupe = await this.productRepo.findBySkuOrSlug(input.sku, input.slug);
      if (dupe && dupe.id !== id) {
        throw new AppError('A product with this SKU or slug already exists', 409);
      }
    }
    await this.productRepo.updateWithImages(
      id,
      {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        sku: input.sku,
        stockQuantity: input.stockQuantity,
        lowStockAlert: input.lowStockAlert ?? existing.lowStockAlert,
        tags: normalizeTags(input.tags),
        ageRangeMin: input.ageRangeMin ?? null,
        ageRangeMax: input.ageRangeMax ?? null,
        isFeatured: input.isFeatured ?? existing.isFeatured,
        isBestSeller: input.isBestSeller ?? existing.isBestSeller,
        isActive: input.isActive ?? existing.isActive,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        categoryId: input.categoryId,
      },
      input.images.map((img, i) => ({
        url: img.url,
        altText: img.altText ?? null,
        sortOrder: img.sortOrder ?? i,
      })),
      input.variants.map((v, i) => this.toVariantWrite(v, i))
    );
    return this.getForAdmin(id);
  }

  private toVariantWrite(v: VariantInput, index: number): VariantWriteInput {
    return {
      id: v.id ?? null,
      label: v.label,
      sku: v.sku?.trim() || null,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? null,
      stockQuantity: v.stockQuantity,
      imageUrl: v.imageUrl ?? null,
      sortOrder: v.sortOrder ?? index,
      isActive: v.isActive ?? true,
    };
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.productRepo.findByIdForAdmin(id);
    if (!existing) throw new AppError('Product not found', 404);
    await this.productRepo.softDelete(id);
  }

  async dashboardStats(): Promise<AdminDashboardStats> {
    return this.productRepo.dashboardStats();
  }

  private assertAgeRange(input: ProductUpsertInput) {
    if (
      input.ageRangeMin != null &&
      input.ageRangeMax != null &&
      input.ageRangeMin > input.ageRangeMax
    ) {
      throw new AppError('Minimum age cannot be greater than maximum age', 400);
    }
  }

  private toAdminDto(
    row: Awaited<ReturnType<ProductRepository['findAllForAdmin']>>[number],
    ratings: Map<string, { avg: number; count: number }>
  ): AdminProductDto {
    const base = toDto(row, ratings);
    return {
      ...base,
      isActive: row.isActive,
      variants: row.variants.map((v) => ({
        id: v.id,
        label: v.label,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice === null ? null : Number(v.compareAtPrice),
        stockQuantity: v.stockQuantity,
        imageUrl: v.imageUrl,
        sortOrder: v.sortOrder,
        isActive: v.isActive,
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
