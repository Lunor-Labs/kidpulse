import { env } from '../config/env';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { getSupabaseAdmin } from '../lib/supabaseAdmin';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthUser } from '../types/express';
import type { CheckoutInput, CheckoutShippingInput } from '../types/accountSchemas';
import type { CheckoutResultDto, OrderDto } from '../types/dto';
import { PromotionsService } from './PromotionsService';
import { EmailService } from './EmailService';
import { ProfileService } from './ProfileService';

const SHIPPING_FLAT_LKR = 350;
const FREE_SHIPPING_THRESHOLD_LKR = 5000;

type FullOrderRow = NonNullable<Awaited<ReturnType<OrderService['findOrderWithItems']>>>;

export class OrderService {
  constructor(
    private promotions = new PromotionsService(),
    private profileService = new ProfileService(),
    private emailService = new EmailService()
  ) {}

  async checkout(
    user: AuthUser | null,
    input: CheckoutInput
  ): Promise<CheckoutResultDto> {
    const shipping = await this.resolveShipping(user, input);
    const priced = await this.priceItems(input.items);

    // Group variant lines by product so per-product quantity discounts pool
    // quantities across variants of the same product.
    const groupedForPromotions = new Map<
      string,
      { productId: string; categoryId: string; price: number; quantity: number; lineTotal: number }
    >();
    for (const item of priced.items) {
      const existing = groupedForPromotions.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.lineTotal = Math.round((existing.lineTotal + item.lineTotal) * 100) / 100;
      } else {
        groupedForPromotions.set(item.productId, {
          productId: item.productId,
          categoryId: item.categoryId,
          price: item.price,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        });
      }
    }
    const pricing = await this.promotions.applyToCart(
      user?.id ?? null,
      [...groupedForPromotions.values()],
      input.couponCode ?? null
    );
    const itemDiscountAmount =
      pricing.autoDiscountAmount + pricing.quantityDiscountAmount;
    const discountAmount = pricing.totalDiscount;
    const subtotalAfterDiscount = Math.max(0, priced.subtotal - discountAmount);
    const shippingAmount =
      subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD_LKR ? 0 : SHIPPING_FLAT_LKR;
    const total = subtotalAfterDiscount + shippingAmount;

    let effectiveUser = user;
    let createdAccount = false;
    let emailVerificationSent = false;
    if (!effectiveUser) {
      const result = await this.autoProvisionAccount(shipping.email, shipping.fullName);
      effectiveUser = {
        id: result.userId,
        email: shipping.email,
        fullName: shipping.fullName,
        role: 'customer',
      };
      createdAccount = result.created;
      emailVerificationSent = result.emailSent;
    }

    await this.profileService.ensureProfile(effectiveUser);

    const orderNumber = generateOrderNumber();
    try {
      const created = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: effectiveUser!.id,
            status: input.paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING_PAYMENT',
            paymentMethod: input.paymentMethod,
            paymentStatus: input.paymentMethod === 'COD' ? 'UNPAID' : 'UNPAID',
            subtotal: priced.subtotal,
            discountAmount,
            autoDiscountAmount: itemDiscountAmount,
            couponDiscountAmount: pricing.couponDiscountAmount,
            shippingAmount,
            total,
            couponId: pricing.coupon?.id ?? null,
            couponCode: pricing.coupon?.code ?? null,
            shipFullName: shipping.fullName,
            shipPhone: shipping.phone,
            shipEmail: shipping.email,
            shipAddressLine1: shipping.addressLine1,
            shipAddressLine2: shipping.addressLine2 ?? null,
            shipCity: shipping.city,
            shipDistrict: shipping.district,
            shipPostalCode: shipping.postalCode ?? null,
            shipCountry: shipping.country ?? 'Sri Lanka',
            notes: input.notes ?? null,
            items: {
              create: priced.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                imageUrl: item.imageUrl,
                price: item.price,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
              })),
            },
          },
          include: { items: { include: { product: { select: { slug: true } } } } },
        });
        const productsWithVariantLines = new Set<string>();
        for (const item of priced.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
            productsWithVariantLines.add(item.productId);
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }
        }
        for (const productId of productsWithVariantLines) {
          const agg = await tx.productVariant.aggregate({
            where: { productId, deletedAt: null, isActive: true },
            _sum: { stockQuantity: true },
          });
          await tx.product.update({
            where: { id: productId },
            data: { stockQuantity: agg._sum.stockQuantity ?? 0 },
          });
        }
        return order;
      });
      if (pricing.coupon) {
        await this.promotions
          .recordRedemption(pricing.coupon.id, effectiveUser!.id, created.id)
          .catch(() => undefined);
      }
      const dto = this.toDto(created as FullOrderRow);
      await this.sendPostCheckoutEmails(dto, createdAccount).catch((err) => {
        logger.warn({ err }, 'Post-checkout email failed');
      });
      await this.sendLowStockAlerts(priced.items).catch((err) => {
        logger.warn({ err }, 'Low-stock alert email failed');
      });
      return {
        order: dto,
        createdAccount,
        emailVerificationSent,
      };
    } catch (error) {
      logger.error({ error, userId: effectiveUser?.id }, 'Order creation failed');
      throw new AppError('Unable to place order', 500);
    }
  }

  async listForUser(user: AuthUser): Promise<OrderDto[]> {
    await this.profileService.ensureProfile(user);
    const rows = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { slug: true } } } } },
    });
    return rows.map((r) => this.toDto(r as FullOrderRow));
  }

  async getForUserByNumber(user: AuthUser, orderNumber: string): Promise<OrderDto> {
    const row = await this.findOrderWithItems({ userId: user.id, orderNumber });
    if (!row) throw new AppError('Order not found', 404);
    return this.toDto(row);
  }

  private findOrderWithItems(where: { userId?: string; orderNumber: string }) {
    return prisma.order.findFirst({
      where,
      include: { items: { include: { product: { select: { slug: true } } } } },
    });
  }

  private async priceItems(items: CheckoutInput['items']) {
    if (items.length === 0) throw new AppError('Cart is empty', 400);
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, deletedAt: null, isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { where: { deletedAt: null, isActive: true } },
      },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const priced = items.map((input) => {
      const product = byId.get(input.productId);
      if (!product) throw new AppError(`Product no longer available`, 400);

      const variant = input.variantId
        ? product.variants.find((v) => v.id === input.variantId)
        : null;
      if (input.variantId && !variant) {
        throw new AppError(`Selected option of "${product.name}" is no longer available`, 400);
      }

      const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
      const displayName = variant ? `${product.name} (${variant.label})` : product.name;
      if (availableStock < input.quantity) {
        throw new AppError(`Only ${availableStock} left of "${displayName}"`, 400);
      }
      const price = Number(variant ? variant.price : product.price);
      const lineTotal = Math.round(price * input.quantity * 100) / 100;
      subtotal = Math.round((subtotal + lineTotal) * 100) / 100;
      return {
        productId: product.id,
        variantId: variant?.id ?? null,
        categoryId: product.categoryId,
        name: displayName,
        sku: variant?.sku ?? product.sku,
        imageUrl: variant?.imageUrl ?? product.images[0]?.url ?? null,
        price,
        quantity: input.quantity,
        lineTotal,
        stockBefore: availableStock,
        lowStockAlert: product.lowStockAlert,
      };
    });
    return { subtotal, items: priced };
  }

  private async resolveShipping(
    user: AuthUser | null,
    input: CheckoutInput
  ): Promise<Required<Pick<CheckoutShippingInput, 'fullName' | 'phone' | 'email' | 'addressLine1' | 'city' | 'district'>> & CheckoutShippingInput> {
    if (input.addressId && user) {
      const address = await prisma.address.findFirst({
        where: { id: input.addressId, userId: user.id },
      });
      if (!address) throw new AppError('Address not found', 400);
      return {
        fullName: address.fullName,
        phone: address.phone,
        email: user.email ?? input.shippingAddress?.email ?? '',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        district: address.district,
        postalCode: address.postalCode,
        country: address.country,
      };
    }
    if (input.shippingAddress) {
      const s = input.shippingAddress;
      return {
        fullName: s.fullName,
        phone: s.phone,
        email: s.email,
        addressLine1: s.addressLine1,
        addressLine2: s.addressLine2 ?? null,
        city: s.city,
        district: s.district,
        postalCode: s.postalCode ?? null,
        country: s.country ?? 'Sri Lanka',
      };
    }
    throw new AppError('Shipping address is required', 400);
  }

  private async autoProvisionAccount(
    email: string,
    fullName: string
  ): Promise<{ userId: string; created: boolean; emailSent: boolean }> {
    const supa = getSupabaseAdmin();
    let userId: string | null = null;
    let created = false;
    for (let page = 1; page <= 20; page += 1) {
      const { data, error } = await supa.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new AppError('Auth lookup failed', 500);
      const match = data.users.find(
        (u: SupabaseUser) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (match) {
        userId = match.id;
        break;
      }
      if (data.users.length < 200) break;
    }
    if (!userId) {
      const { data, error } = await supa.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: { fullName },
        app_metadata: { role: 'customer' },
      });
      if (error || !data.user) throw new AppError('Unable to create guest account', 500);
      userId = data.user.id;
      created = true;
    }
    let emailSent = false;
    if (created) {
      try {
        await supa.auth.admin.generateLink({ type: 'magiclink', email });
        emailSent = true;
      } catch (err) {
        logger.warn({ err }, 'Guest magic link generation failed');
      }
    }
    if (!userId) throw new AppError('Unable to resolve guest account', 500);
    return { userId, created, emailSent };
  }

  private async sendLowStockAlerts(
    items: Array<{
      name: string;
      sku: string;
      quantity: number;
      stockBefore: number;
      lowStockAlert: number;
    }>
  ): Promise<void> {
    const newlyCrossed = items
      .filter(
        (item) =>
          item.stockBefore > item.lowStockAlert &&
          item.stockBefore - item.quantity <= item.lowStockAlert
      )
      .map((item) => ({
        name: item.name,
        sku: item.sku,
        stockQuantity: item.stockBefore - item.quantity,
        threshold: item.lowStockAlert,
      }));
    if (newlyCrossed.length === 0) return;
    const settings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
    const to = settings?.supportEmail;
    if (!to) {
      logger.info(
        { items: newlyCrossed },
        'Low stock detected but no supportEmail configured — alert skipped'
      );
      return;
    }
    await this.emailService.sendLowStockAlert(to, newlyCrossed);
  }

  private async sendPostCheckoutEmails(order: OrderDto, createdAccount: boolean): Promise<void> {
    const ctx = {
      orderNumber: order.orderNumber,
      customerName: order.ship.fullName,
      total: order.total,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingAmount: order.shippingAmount,
      currency: order.currency,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      ship: order.ship,
      webBaseUrl: env.WEB_BASE_URL,
    };

    await this.emailService.sendOrderConfirmation(order.ship.email, ctx);

    if (order.paymentMethod === 'BANK_TRANSFER') {
      const settings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
      await this.emailService.sendBankTransferInstructions(order.ship.email, ctx, {
        bankAccountName: settings?.bankAccountName ?? null,
        bankName: settings?.bankName ?? null,
        bankBranch: settings?.bankBranch ?? null,
        bankAccountNumber: settings?.bankAccountNumber ?? null,
        whatsappNumber: settings?.whatsappNumber ?? null,
        deadlineDays: settings?.bankTransferDeadlineDays ?? 1,
      });
    }

    if (createdAccount) {
      await this.emailService.sendWelcomeGuest(order.ship.email, {
        fullName: order.ship.fullName,
        loginUrl: `${env.WEB_BASE_URL}/login`,
      });
    }
  }

  private toDto(row: FullOrderRow): OrderDto {
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      status: row.status,
      paymentMethod: row.paymentMethod,
      paymentStatus: row.paymentStatus,
      paymentAttempts: row.paymentAttempts,
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
        variantId: item.variantId,
        productSlug: item.product?.slug ?? null,
        name: item.name,
        imageUrl: item.imageUrl,
        price: Number(item.price),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

function generateOrderNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `KP-${ts}${rand}`;
}

