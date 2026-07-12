import { AppError } from '../lib/AppError';
import { prisma } from '../lib/prisma';
import type { CouponUpsertInput } from '../types/adminSchemas';

export interface AdminCouponDto {
  id: string;
  code: string;
  description: string | null;
  type: 'FIXED' | 'PERCENT';
  value: number;
  minSubtotal: number | null;
  maxRedemptions: number | null;
  perCustomerLimit: number | null;
  totalRedemptions: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type CouponRow = Awaited<ReturnType<typeof prisma.coupon.findFirst>>;

export class AdminCouponService {
  async list(): Promise<AdminCouponDto[]> {
    const rows = await prisma.coupon.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async get(id: string): Promise<AdminCouponDto> {
    const row = await prisma.coupon.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new AppError('Coupon not found', 404);
    return this.toDto(row);
  }

  async create(input: CouponUpsertInput): Promise<AdminCouponDto> {
    const code = input.code.trim().toUpperCase();
    const dupe = await prisma.coupon.findFirst({ where: { code } });
    if (dupe) throw new AppError('Coupon code already exists', 409);
    const row = await prisma.coupon.create({
      data: {
        code,
        description: input.description ?? null,
        type: input.type,
        value: input.value,
        minSubtotal: input.minSubtotal ?? null,
        maxRedemptions: input.maxRedemptions ?? null,
        perCustomerLimit: input.perCustomerLimit ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: input.isActive ?? true,
      },
    });
    return this.toDto(row);
  }

  async update(id: string, input: CouponUpsertInput): Promise<AdminCouponDto> {
    const existing = await prisma.coupon.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Coupon not found', 404);
    const code = input.code.trim().toUpperCase();
    if (code !== existing.code) {
      const dupe = await prisma.coupon.findFirst({
        where: { code, NOT: { id } },
      });
      if (dupe) throw new AppError('Coupon code already exists', 409);
    }
    const row = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        description: input.description ?? null,
        type: input.type,
        value: input.value,
        minSubtotal: input.minSubtotal ?? null,
        maxRedemptions: input.maxRedemptions ?? null,
        perCustomerLimit: input.perCustomerLimit ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: input.isActive ?? true,
      },
    });
    return this.toDto(row);
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.coupon.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Coupon not found', 404);
    await prisma.coupon.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private toDto(row: NonNullable<CouponRow>): AdminCouponDto {
    return {
      id: row.id,
      code: row.code,
      description: row.description,
      type: row.type as 'FIXED' | 'PERCENT',
      value: Number(row.value),
      minSubtotal: row.minSubtotal ? Number(row.minSubtotal) : null,
      maxRedemptions: row.maxRedemptions,
      perCustomerLimit: row.perCustomerLimit,
      totalRedemptions: row.totalRedemptions,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
