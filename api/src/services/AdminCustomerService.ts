import { AppError } from '../lib/AppError';
import { prisma } from '../lib/prisma';

export interface AdminCustomerListItemDto {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  wishlistCount: number;
  reviewCount: number;
  lastOrderAt: string | null;
  createdAt: string;
}

export interface AdminCustomerListResult {
  data: AdminCustomerListItemDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminCustomerOrderSummaryDto {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface AdminCustomerAddressDto {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface AdminCustomerReviewDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  rating: number;
  title: string | null;
  body: string;
  isApproved: boolean;
  createdAt: string;
}

export interface AdminCustomerDetailDto {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  wishlistCount: number;
  reviewCount: number;
  addresses: AdminCustomerAddressDto[];
  recentOrders: AdminCustomerOrderSummaryDto[];
  reviews: AdminCustomerReviewDto[];
}

export interface ListCustomersFilter {
  search?: string;
  limit?: number;
  offset?: number;
}

export class AdminCustomerService {
  async list(filter: ListCustomersFilter): Promise<AdminCustomerListResult> {
    const limit = Math.min(Math.max(filter.limit ?? 25, 1), 200);
    const offset = Math.max(filter.offset ?? 0, 0);
    const q = filter.search?.trim();
    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [rows, total] = await Promise.all([
      prisma.userProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true, wishlist: true } },
        },
      }),
      prisma.userProfile.count({ where }),
    ]);

    const userIds = rows.map((r) => r.id);
    const [orderAggs, reviewCounts] = await Promise.all([
      userIds.length
        ? prisma.order.groupBy({
            by: ['userId'],
            where: { userId: { in: userIds } },
            _sum: { total: true },
            _max: { createdAt: true },
          })
        : Promise.resolve([]),
      userIds.length
        ? prisma.review.groupBy({
            by: ['userId'],
            where: { userId: { in: userIds } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);
    const orderMap = new Map<string, { total: number; lastAt: Date | null }>();
    for (const agg of orderAggs) {
      orderMap.set(agg.userId, {
        total: agg._sum.total ? Number(agg._sum.total) : 0,
        lastAt: agg._max.createdAt ?? null,
      });
    }
    const reviewMap = new Map<string, number>();
    for (const agg of reviewCounts) reviewMap.set(agg.userId, agg._count._all);

    return {
      data: rows.map((r) => ({
        id: r.id,
        email: r.email,
        fullName: r.fullName,
        phone: r.phone,
        orderCount: r._count.orders,
        totalSpent: orderMap.get(r.id)?.total ?? 0,
        wishlistCount: r._count.wishlist,
        reviewCount: reviewMap.get(r.id) ?? 0,
        lastOrderAt: orderMap.get(r.id)?.lastAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    };
  }

  async get(id: string): Promise<AdminCustomerDetailDto> {
    const row = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            total: true,
            currency: true,
            createdAt: true,
            _count: { select: { items: true } },
          },
        },
        _count: { select: { orders: true, wishlist: true } },
      },
    });
    if (!row) throw new AppError('Customer not found', 404);

    const [totalSpentAgg, reviews] = await Promise.all([
      prisma.order.aggregate({
        where: { userId: id },
        _sum: { total: true },
      }),
      prisma.review.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          product: { select: { name: true, slug: true } },
        },
      }),
    ]);

    return {
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      phone: row.phone,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      orderCount: row._count.orders,
      totalSpent: totalSpentAgg._sum.total ? Number(totalSpentAgg._sum.total) : 0,
      wishlistCount: row._count.wishlist,
      reviewCount: reviews.length,
      addresses: row.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        city: a.city,
        district: a.district,
        postalCode: a.postalCode,
        country: a.country,
        isDefault: a.isDefault,
      })),
      recentOrders: row.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        total: Number(o.total),
        currency: o.currency,
        itemCount: o._count.items,
        createdAt: o.createdAt.toISOString(),
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.product.name,
        productSlug: r.product.slug,
        rating: r.rating,
        title: r.title,
        body: r.body,
        isApproved: r.isApproved,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async deleteReview(reviewId: string): Promise<void> {
    const existing = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new AppError('Review not found', 404);
    await prisma.review.delete({ where: { id: reviewId } });
  }

  async setReviewApproval(
    reviewId: string,
    isApproved: boolean
  ): Promise<{ id: string; isApproved: boolean }> {
    const existing = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new AppError('Review not found', 404);
    const row = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
    });
    return { id: row.id, isApproved: row.isApproved };
  }
}
