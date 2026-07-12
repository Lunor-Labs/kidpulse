import { AppError } from '../lib/AppError';
import { prisma } from '../lib/prisma';
import type {
  AutoDiscountUpsertInput,
  QuantityDiscountUpsertInput,
  SpendThresholdUpsertInput,
} from '../types/adminSchemas';

export interface AdminAutoDiscountDto {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminQuantityDiscountDto {
  id: string;
  name: string;
  productId: string | null;
  productName: string | null;
  minQuantity: number;
  type: 'FIXED' | 'PERCENT';
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSpendThresholdDto {
  id: string;
  name: string;
  minSubtotal: number;
  type: 'FIXED' | 'PERCENT';
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AdminDiscountService {
  async listAuto(): Promise<AdminAutoDiscountDto[]> {
    const rows = await prisma.autoDiscount.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      categoryId: r.categoryId,
      categoryName: r.category.name,
      type: r.type as 'FIXED' | 'PERCENT',
      value: Number(r.value),
      startsAt: r.startsAt ? r.startsAt.toISOString() : null,
      endsAt: r.endsAt ? r.endsAt.toISOString() : null,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async createAuto(input: AutoDiscountUpsertInput): Promise<AdminAutoDiscountDto> {
    const cat = await prisma.category.findFirst({
      where: { id: input.categoryId, deletedAt: null },
    });
    if (!cat) throw new AppError('Category not found', 400);
    const row = await prisma.autoDiscount.create({
      data: {
        name: input.name,
        categoryId: input.categoryId,
        type: input.type,
        value: input.value,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        isActive: input.isActive ?? true,
      },
      include: { category: { select: { name: true } } },
    });
    return {
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      categoryName: row.category.name,
      type: row.type as 'FIXED' | 'PERCENT',
      value: Number(row.value),
      startsAt: row.startsAt ? row.startsAt.toISOString() : null,
      endsAt: row.endsAt ? row.endsAt.toISOString() : null,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateAuto(id: string, input: AutoDiscountUpsertInput): Promise<AdminAutoDiscountDto> {
    const existing = await prisma.autoDiscount.findUnique({ where: { id } });
    if (!existing) throw new AppError('Discount not found', 404);
    const cat = await prisma.category.findFirst({
      where: { id: input.categoryId, deletedAt: null },
    });
    if (!cat) throw new AppError('Category not found', 400);
    const row = await prisma.autoDiscount.update({
      where: { id },
      data: {
        name: input.name,
        categoryId: input.categoryId,
        type: input.type,
        value: input.value,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        isActive: input.isActive ?? true,
      },
      include: { category: { select: { name: true } } },
    });
    return {
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      categoryName: row.category.name,
      type: row.type as 'FIXED' | 'PERCENT',
      value: Number(row.value),
      startsAt: row.startsAt ? row.startsAt.toISOString() : null,
      endsAt: row.endsAt ? row.endsAt.toISOString() : null,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async removeAuto(id: string): Promise<void> {
    const existing = await prisma.autoDiscount.findUnique({ where: { id } });
    if (!existing) throw new AppError('Discount not found', 404);
    await prisma.autoDiscount.delete({ where: { id } });
  }

  async listQuantity(): Promise<AdminQuantityDiscountDto[]> {
    const rows = await prisma.quantityDiscount.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      productId: r.productId,
      productName: r.product?.name ?? null,
      minQuantity: r.minQuantity,
      type: r.type as 'FIXED' | 'PERCENT',
      value: Number(r.value),
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async createQuantity(input: QuantityDiscountUpsertInput): Promise<AdminQuantityDiscountDto> {
    if (input.productId) {
      const p = await prisma.product.findFirst({
        where: { id: input.productId, deletedAt: null },
      });
      if (!p) throw new AppError('Product not found', 400);
    }
    const row = await prisma.quantityDiscount.create({
      data: {
        name: input.name,
        productId: input.productId ?? null,
        minQuantity: input.minQuantity,
        type: input.type,
        value: input.value,
        isActive: input.isActive ?? true,
      },
      include: { product: { select: { name: true } } },
    });
    return {
      id: row.id,
      name: row.name,
      productId: row.productId,
      productName: row.product?.name ?? null,
      minQuantity: row.minQuantity,
      type: row.type as 'FIXED' | 'PERCENT',
      value: Number(row.value),
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateQuantity(
    id: string,
    input: QuantityDiscountUpsertInput
  ): Promise<AdminQuantityDiscountDto> {
    const existing = await prisma.quantityDiscount.findUnique({ where: { id } });
    if (!existing) throw new AppError('Discount not found', 404);
    if (input.productId) {
      const p = await prisma.product.findFirst({
        where: { id: input.productId, deletedAt: null },
      });
      if (!p) throw new AppError('Product not found', 400);
    }
    const row = await prisma.quantityDiscount.update({
      where: { id },
      data: {
        name: input.name,
        productId: input.productId ?? null,
        minQuantity: input.minQuantity,
        type: input.type,
        value: input.value,
        isActive: input.isActive ?? true,
      },
      include: { product: { select: { name: true } } },
    });
    return {
      id: row.id,
      name: row.name,
      productId: row.productId,
      productName: row.product?.name ?? null,
      minQuantity: row.minQuantity,
      type: row.type as 'FIXED' | 'PERCENT',
      value: Number(row.value),
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async removeQuantity(id: string): Promise<void> {
    const existing = await prisma.quantityDiscount.findUnique({ where: { id } });
    if (!existing) throw new AppError('Discount not found', 404);
    await prisma.quantityDiscount.delete({ where: { id } });
  }

  async listSpend(): Promise<AdminSpendThresholdDto[]> {
    const rows = await prisma.spendThresholdDiscount.findMany({
      orderBy: { minSubtotal: 'asc' },
    });
    return rows.map((r) => this.toSpendDto(r));
  }

  async createSpend(input: SpendThresholdUpsertInput): Promise<AdminSpendThresholdDto> {
    const row = await prisma.spendThresholdDiscount.create({
      data: {
        name: input.name,
        minSubtotal: input.minSubtotal,
        type: input.type,
        value: input.value,
        isActive: input.isActive ?? true,
      },
    });
    return this.toSpendDto(row);
  }

  async updateSpend(
    id: string,
    input: SpendThresholdUpsertInput
  ): Promise<AdminSpendThresholdDto> {
    const existing = await prisma.spendThresholdDiscount.findUnique({ where: { id } });
    if (!existing) throw new AppError('Discount not found', 404);
    const row = await prisma.spendThresholdDiscount.update({
      where: { id },
      data: {
        name: input.name,
        minSubtotal: input.minSubtotal,
        type: input.type,
        value: input.value,
        isActive: input.isActive ?? true,
      },
    });
    return this.toSpendDto(row);
  }

  async removeSpend(id: string): Promise<void> {
    const existing = await prisma.spendThresholdDiscount.findUnique({ where: { id } });
    if (!existing) throw new AppError('Discount not found', 404);
    await prisma.spendThresholdDiscount.delete({ where: { id } });
  }

  private toSpendDto(row: {
    id: string;
    name: string;
    minSubtotal: unknown;
    type: string;
    value: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AdminSpendThresholdDto {
    return {
      id: row.id,
      name: row.name,
      minSubtotal: Number(row.minSubtotal),
      type: row.type as 'FIXED' | 'PERCENT',
      value: Number(row.value),
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
