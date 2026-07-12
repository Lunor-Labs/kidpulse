import { AppError } from '../lib/AppError';
import { prisma } from '../lib/prisma';
import { ProductBannerUpsertInput } from '../types/adminSchemas';
import { AdminProductBannerDto, ProductBannerDto } from '../types/dto';

type Row = Awaited<ReturnType<typeof prisma.productBanner.findMany>>[number] & {
  product?: { name: string } | null;
};

function toPublicDto(row: Row): ProductBannerDto {
  return {
    id: row.id,
    productId: row.productId,
    eyebrow: row.eyebrow,
    headline: row.headline,
    subheadline: row.subheadline,
    imageUrl: row.imageUrl,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    gradient: row.gradient,
    sortOrder: row.sortOrder,
  };
}

function toAdminDto(row: Row): AdminProductBannerDto {
  return {
    ...toPublicDto(row),
    isActive: row.isActive,
    productName: row.product?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ProductBannerService {
  async getForProduct(productId: string): Promise<ProductBannerDto | null> {
    const specific = await prisma.productBanner.findFirst({
      where: { productId, isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    if (specific) return toPublicDto(specific);
    const global = await prisma.productBanner.findFirst({
      where: { productId: null, isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return global ? toPublicDto(global) : null;
  }

  async listForAdmin(): Promise<AdminProductBannerDto[]> {
    const rows = await prisma.productBanner.findMany({
      where: { deletedAt: null },
      orderBy: [{ productId: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { product: { select: { name: true } } },
    });
    return rows.map((r) => toAdminDto(r as Row));
  }

  async getForAdmin(id: string): Promise<AdminProductBannerDto> {
    const row = await prisma.productBanner.findFirst({
      where: { id, deletedAt: null },
      include: { product: { select: { name: true } } },
    });
    if (!row) throw new AppError('Banner not found', 404);
    return toAdminDto(row as Row);
  }

  async create(input: ProductBannerUpsertInput): Promise<AdminProductBannerDto> {
    if (input.productId) {
      const product = await prisma.product.findFirst({
        where: { id: input.productId, deletedAt: null },
        select: { id: true },
      });
      if (!product) throw new AppError('Product not found', 400);
    }
    const row = await prisma.productBanner.create({
      data: {
        productId: input.productId ?? null,
        eyebrow: input.eyebrow ?? null,
        headline: input.headline,
        subheadline: input.subheadline ?? null,
        imageUrl: input.imageUrl ?? null,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        gradient: input.gradient ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
      include: { product: { select: { name: true } } },
    });
    return toAdminDto(row as Row);
  }

  async update(id: string, input: ProductBannerUpsertInput): Promise<AdminProductBannerDto> {
    const existing = await prisma.productBanner.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Banner not found', 404);
    if (input.productId) {
      const product = await prisma.product.findFirst({
        where: { id: input.productId, deletedAt: null },
        select: { id: true },
      });
      if (!product) throw new AppError('Product not found', 400);
    }
    const row = await prisma.productBanner.update({
      where: { id },
      data: {
        productId: input.productId ?? null,
        eyebrow: input.eyebrow ?? null,
        headline: input.headline,
        subheadline: input.subheadline ?? null,
        imageUrl: input.imageUrl ?? null,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        gradient: input.gradient ?? null,
        sortOrder: input.sortOrder ?? existing.sortOrder,
        isActive: input.isActive ?? existing.isActive,
      },
      include: { product: { select: { name: true } } },
    });
    return toAdminDto(row as Row);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await prisma.productBanner.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Banner not found', 404);
    await prisma.productBanner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
