import { AppError } from '../lib/AppError';
import { prisma } from '../lib/prisma';

export interface MomentsGalleryItemDto {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface AdminMomentsGalleryItemDto extends MomentsGalleryItemDto {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MomentsItemInput {
  imageUrl: string;
  sortOrder?: number;
  isActive?: boolean;
}

type Row = Awaited<ReturnType<typeof prisma.momentsGalleryItem.findMany>>[number];

function toPublicDto(row: Row): MomentsGalleryItemDto {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
  };
}

function toAdminDto(row: Row): AdminMomentsGalleryItemDto {
  return {
    ...toPublicDto(row),
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class MomentsGalleryService {
  async listPublic(): Promise<MomentsGalleryItemDto[]> {
    const rows = await prisma.momentsGalleryItem.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toPublicDto);
  }

  async listForAdmin(): Promise<AdminMomentsGalleryItemDto[]> {
    const rows = await prisma.momentsGalleryItem.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return rows.map(toAdminDto);
  }

  async getForAdmin(id: string): Promise<AdminMomentsGalleryItemDto> {
    const row = await prisma.momentsGalleryItem.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new AppError('Item not found', 404);
    return toAdminDto(row);
  }

  async create(input: MomentsItemInput): Promise<AdminMomentsGalleryItemDto> {
    const row = await prisma.momentsGalleryItem.create({
      data: {
        imageUrl: input.imageUrl,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return toAdminDto(row);
  }

  async update(id: string, input: MomentsItemInput): Promise<AdminMomentsGalleryItemDto> {
    const existing = await prisma.momentsGalleryItem.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new AppError('Item not found', 404);
    const row = await prisma.momentsGalleryItem.update({
      where: { id },
      data: {
        imageUrl: input.imageUrl,
        sortOrder: input.sortOrder ?? existing.sortOrder,
        isActive: input.isActive ?? existing.isActive,
      },
    });
    return toAdminDto(row);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await prisma.momentsGalleryItem.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new AppError('Item not found', 404);
    await prisma.momentsGalleryItem.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}