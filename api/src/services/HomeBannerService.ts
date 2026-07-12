import { AppError } from '../lib/AppError';
import { prisma } from '../lib/prisma';
import { BannerUpsertInput } from '../types/adminSchemas';
import { AdminHomeBannerDto, HomeBannerDto } from '../types/dto';

type Row = Awaited<ReturnType<typeof prisma.homeBanner.findMany>>[number];

function toPublicDto(row: Row): HomeBannerDto {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    headline: row.headline,
    subheadline: row.subheadline,
    imageUrl: row.imageUrl,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    sortOrder: row.sortOrder,
  };
}

function toAdminDto(row: Row): AdminHomeBannerDto {
  return {
    ...toPublicDto(row),
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class HomeBannerService {
  async listPublic(): Promise<HomeBannerDto[]> {
    const rows = await prisma.homeBanner.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toPublicDto);
  }

  async listForAdmin(): Promise<AdminHomeBannerDto[]> {
    const rows = await prisma.homeBanner.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return rows.map(toAdminDto);
  }

  async getForAdmin(id: string): Promise<AdminHomeBannerDto> {
    const row = await prisma.homeBanner.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new AppError('Banner not found', 404);
    return toAdminDto(row);
  }

  async create(input: BannerUpsertInput): Promise<AdminHomeBannerDto> {
    const row = await prisma.homeBanner.create({
      data: {
        eyebrow: input.eyebrow ?? null,
        headline: input.headline,
        subheadline: input.subheadline ?? null,
        imageUrl: input.imageUrl,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return toAdminDto(row);
  }

  async update(id: string, input: BannerUpsertInput): Promise<AdminHomeBannerDto> {
    const existing = await prisma.homeBanner.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Banner not found', 404);
    const row = await prisma.homeBanner.update({
      where: { id },
      data: {
        eyebrow: input.eyebrow ?? null,
        headline: input.headline,
        subheadline: input.subheadline ?? null,
        imageUrl: input.imageUrl,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        sortOrder: input.sortOrder ?? existing.sortOrder,
        isActive: input.isActive ?? existing.isActive,
      },
    });
    return toAdminDto(row);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await prisma.homeBanner.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Banner not found', 404);
    await prisma.homeBanner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
