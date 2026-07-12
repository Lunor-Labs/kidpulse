import { env } from '../config/env';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import type { AuthUser } from '../types/express';
import type {
  AdminOrderDetailDto,
  AdminOrderListItemDto,
  AdminOrderPaymentDto,
  AdminOrderStatusEventDto,
} from '../types/adminOrderDto';
import { EmailService } from './EmailService';

export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PROCESSING', 'CANCELLED', 'FAILED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
};

export function isValidTransition(from: string, to: string): boolean {
  const fromKey = from as OrderStatus;
  if (!TRANSITIONS[fromKey]) return false;
  return TRANSITIONS[fromKey].includes(to as OrderStatus);
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

export interface ListFilter {
  status?: string;
  search?: string;
  limit?: number;
}

export interface UpdateShippingInput {
  shipFullName?: string;
  shipPhone?: string;
  shipAddressLine1?: string;
  shipAddressLine2?: string | null;
  shipCity?: string;
  shipDistrict?: string;
  shipPostalCode?: string | null;
  shipCountry?: string;
}

export class AdminOrderService {
  constructor(private emailService = new EmailService()) {}

  async list(filter: ListFilter): Promise<AdminOrderListItemDto[]> {
    const where: Record<string, unknown> = {};
    if (filter.status && filter.status !== 'ALL') where.status = filter.status;
    if (filter.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { shipFullName: { contains: q, mode: 'insensitive' } },
        { shipEmail: { contains: q, mode: 'insensitive' } },
        { shipPhone: { contains: q, mode: 'insensitive' } },
      ];
    }
    const rows = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(filter.limit ?? 100, 1), 500),
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        total: true,
        currency: true,
        shipFullName: true,
        shipEmail: true,
        shipPhone: true,
        shipCity: true,
        shipDistrict: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      status: r.status,
      paymentMethod: r.paymentMethod,
      paymentStatus: r.paymentStatus,
      total: Number(r.total),
      currency: r.currency,
      customerName: r.shipFullName,
      customerEmail: r.shipEmail,
      customerPhone: r.shipPhone,
      city: r.shipCity,
      district: r.shipDistrict,
      itemCount: r._count.items,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getByNumber(orderNumber: string): Promise<AdminOrderDetailDto> {
    const row = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: { select: { slug: true } } } },
        payments: { orderBy: { createdAt: 'desc' } },
        statusEvents: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!row) throw new AppError('Order not found', 404);
    return this.toDetailDto(row);
  }

  private async loadOrThrow(id: string) {
    const row = await prisma.order.findUnique({ where: { id } });
    if (!row) throw new AppError('Order not found', 404);
    return row;
  }

  allowedTransitionsFor(status: string): string[] {
    return TRANSITIONS[status as OrderStatus] ?? [];
  }

  async updateStatus(
    id: string,
    to: string,
    actor: AuthUser,
    note?: string | null
  ): Promise<AdminOrderDetailDto> {
    const row = await this.loadOrThrow(id);
    if (row.status === to) throw new AppError('Order is already in that status', 400);
    if (!isValidTransition(row.status, to)) {
      throw new AppError(`Cannot move order from ${row.status} to ${to}`, 400);
    }
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: to },
      }),
      prisma.orderStatusEvent.create({
        data: {
          orderId: id,
          fromStatus: row.status,
          toStatus: to,
          actorType: 'ADMIN',
          actorId: actor.id,
          note: note?.trim() ? note.trim() : null,
        },
      }),
    ]);
    await this.emailService
      .sendStatusChange(row.shipEmail, {
        orderNumber: row.orderNumber,
        customerName: row.shipFullName,
        fromStatus: row.status,
        toStatus: to,
        webBaseUrl: env.WEB_BASE_URL,
      })
      .catch((err) => logger.warn({ err }, 'Status change email failed'));
    return this.getByNumber(row.orderNumber);
  }

  async updateShipping(
    id: string,
    patch: UpdateShippingInput,
    actor: AuthUser
  ): Promise<AdminOrderDetailDto> {
    const row = await this.loadOrThrow(id);
    if (row.status === 'DELIVERED' || row.status === 'CANCELLED') {
      throw new AppError('Cannot edit shipping on a completed order', 400);
    }
    const data: Record<string, unknown> = {};
    for (const key of [
      'shipFullName',
      'shipPhone',
      'shipAddressLine1',
      'shipAddressLine2',
      'shipCity',
      'shipDistrict',
      'shipPostalCode',
      'shipCountry',
    ] as const) {
      if (patch[key] !== undefined) data[key] = patch[key];
    }
    if (Object.keys(data).length === 0) return this.getByNumber(row.orderNumber);

    await prisma.$transaction([
      prisma.order.update({ where: { id }, data }),
      prisma.orderStatusEvent.create({
        data: {
          orderId: id,
          fromStatus: row.status,
          toStatus: row.status,
          actorType: 'ADMIN',
          actorId: actor.id,
          note: 'Shipping details updated',
        },
      }),
    ]);
    return this.getByNumber(row.orderNumber);
  }

  async confirmBankPayment(id: string, actor: AuthUser): Promise<AdminOrderDetailDto> {
    const row = await this.loadOrThrow(id);
    if (row.paymentMethod !== 'BANK_TRANSFER') {
      throw new AppError('Order is not a bank transfer order', 400);
    }
    if (row.paymentStatus === 'PAID') {
      throw new AppError('Order is already marked paid', 400);
    }
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      }),
      prisma.payment.create({
        data: {
          orderId: id,
          provider: 'BANK_TRANSFER',
          status: 'SUCCESS',
          amount: row.total,
          rawPayload: JSON.stringify({ confirmedBy: actor.id }),
        },
      }),
      prisma.orderStatusEvent.create({
        data: {
          orderId: id,
          fromStatus: row.status,
          toStatus: 'PROCESSING',
          actorType: 'ADMIN',
          actorId: actor.id,
          note: 'Bank transfer confirmed by admin',
        },
      }),
    ]);
    await this.emailService
      .sendPaymentReceived(row.shipEmail, {
        orderNumber: row.orderNumber,
        customerName: row.shipFullName,
        total: Number(row.total),
        subtotal: Number(row.subtotal),
        discountAmount: Number(row.discountAmount),
        shippingAmount: Number(row.shippingAmount),
        currency: row.currency,
        items: [],
        ship: {
          fullName: row.shipFullName,
          phone: row.shipPhone,
          addressLine1: row.shipAddressLine1,
          addressLine2: row.shipAddressLine2,
          city: row.shipCity,
          district: row.shipDistrict,
          postalCode: row.shipPostalCode,
          country: row.shipCountry,
        },
        webBaseUrl: env.WEB_BASE_URL,
      })
      .catch((err) => logger.warn({ err }, 'Payment received email failed'));
    return this.getByNumber(row.orderNumber);
  }

  async cancelBankPayment(
    id: string,
    actor: AuthUser,
    note?: string | null
  ): Promise<AdminOrderDetailDto> {
    const row = await this.loadOrThrow(id);
    if (row.paymentMethod !== 'BANK_TRANSFER') {
      throw new AppError('Order is not a bank transfer order', 400);
    }
    if (row.status === 'CANCELLED') {
      throw new AppError('Order is already cancelled', 400);
    }
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      }),
      prisma.orderStatusEvent.create({
        data: {
          orderId: id,
          fromStatus: row.status,
          toStatus: 'CANCELLED',
          actorType: 'ADMIN',
          actorId: actor.id,
          note: note?.trim() ? note.trim() : 'Bank transfer cancelled by admin',
        },
      }),
    ]);
    await this.emailService
      .sendStatusChange(row.shipEmail, {
        orderNumber: row.orderNumber,
        customerName: row.shipFullName,
        fromStatus: row.status,
        toStatus: 'CANCELLED',
        webBaseUrl: env.WEB_BASE_URL,
      })
      .catch((err) => logger.warn({ err }, 'Cancellation email failed'));
    return this.getByNumber(row.orderNumber);
  }

  async getForInvoice(orderNumber: string) {
    const row = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!row) throw new AppError('Order not found', 404);
    return row;
  }

  private toDetailDto(row: {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    paymentAttempts: number;
    subtotal: unknown;
    discountAmount: unknown;
    shippingAmount: unknown;
    total: unknown;
    currency: string;
    couponCode: string | null;
    shipFullName: string;
    shipPhone: string;
    shipEmail: string;
    shipAddressLine1: string;
    shipAddressLine2: string | null;
    shipCity: string;
    shipDistrict: string;
    shipPostalCode: string | null;
    shipCountry: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      productId: string;
      product?: { slug: string } | null;
      name: string;
      imageUrl: string | null;
      price: unknown;
      quantity: number;
      lineTotal: unknown;
    }>;
    payments: Array<{
      id: string;
      provider: string;
      providerRef: string | null;
      status: string;
      amount: unknown;
      createdAt: Date;
    }>;
    statusEvents: Array<{
      id: string;
      fromStatus: string | null;
      toStatus: string;
      actorType: string;
      actorId: string | null;
      note: string | null;
      createdAt: Date;
    }>;
  }): AdminOrderDetailDto {
    const events: AdminOrderStatusEventDto[] = row.statusEvents.map((ev) => ({
      id: ev.id,
      fromStatus: ev.fromStatus,
      fromStatusLabel: ev.fromStatus ? (STATUS_LABELS[ev.fromStatus] ?? ev.fromStatus) : null,
      toStatus: ev.toStatus,
      toStatusLabel: STATUS_LABELS[ev.toStatus] ?? ev.toStatus,
      actorType: ev.actorType,
      actorId: ev.actorId,
      note: ev.note,
      createdAt: ev.createdAt.toISOString(),
    }));
    const payments: AdminOrderPaymentDto[] = row.payments.map((p) => ({
      id: p.id,
      provider: p.provider,
      providerRef: p.providerRef,
      status: p.status,
      amount: Number(p.amount),
      createdAt: p.createdAt.toISOString(),
    }));
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      status: row.status,
      statusLabel: STATUS_LABELS[row.status] ?? row.status,
      paymentMethod: row.paymentMethod,
      paymentStatus: row.paymentStatus,
      paymentAttempts: row.paymentAttempts,
      allowedTransitions: this.allowedTransitionsFor(row.status),
      subtotal: Number(row.subtotal),
      discountAmount: Number(row.discountAmount),
      shippingAmount: Number(row.shippingAmount),
      total: Number(row.total),
      currency: row.currency,
      couponCode: row.couponCode,
      ship: {
        fullName: row.shipFullName,
        phone: row.shipPhone,
        email: row.shipEmail,
        addressLine1: row.shipAddressLine1,
        addressLine2: row.shipAddressLine2,
        city: row.shipCity,
        district: row.shipDistrict,
        postalCode: row.shipPostalCode,
        country: row.shipCountry,
      },
      notes: row.notes,
      items: row.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSlug: item.product?.slug ?? null,
        name: item.name,
        imageUrl: item.imageUrl,
        price: Number(item.price),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      })),
      payments,
      statusEvents: events,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
