import { AppError } from '../lib/AppError';
import { prisma } from '../lib/prisma';

export interface PricingLineInput {
  productId: string;
  categoryId: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface PricingLineResult extends PricingLineInput {
  autoDiscountAmount: number;
  quantityDiscountAmount: number;
  lineDiscountAmount: number;
  discountedLineTotal: number;
}

export interface AppliedCouponSummary {
  id: string;
  code: string;
  type: 'FIXED' | 'PERCENT';
  amount: number;
  description: string | null;
}

export interface AppliedSpendThresholdSummary {
  id: string;
  name: string;
  amount: number;
}

export interface PricingResult {
  lines: PricingLineResult[];
  subtotal: number;
  autoDiscountAmount: number;
  quantityDiscountAmount: number;
  spendThresholdDiscountAmount: number;
  couponDiscountAmount: number;
  totalDiscount: number;
  coupon: AppliedCouponSummary | null;
  spendThreshold: AppliedSpendThresholdSummary | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export class PromotionsService {
  async applyToCart(
    userId: string | null,
    lines: PricingLineInput[],
    couponCode: string | null | undefined
  ): Promise<PricingResult> {
    const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));

    const categoryIds = Array.from(new Set(lines.map((l) => l.categoryId)));
    const productIds = Array.from(new Set(lines.map((l) => l.productId)));

    const now = new Date();
    const [autoDiscounts, quantityDiscounts, thresholdDiscounts] = await Promise.all([
      categoryIds.length
        ? prisma.autoDiscount.findMany({
            where: {
              isActive: true,
              categoryId: { in: categoryIds },
              AND: [
                { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
                { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
              ],
            },
          })
        : Promise.resolve([]),
      prisma.quantityDiscount.findMany({
        where: {
          isActive: true,
          OR: [{ productId: null }, { productId: { in: productIds } }],
        },
      }),
      prisma.spendThresholdDiscount.findMany({
        where: { isActive: true },
      }),
    ]);

    const autoByCat = new Map<string, typeof autoDiscounts>();
    for (const d of autoDiscounts) {
      const arr = autoByCat.get(d.categoryId) ?? [];
      arr.push(d);
      autoByCat.set(d.categoryId, arr);
    }
    const qtyStoreWide = quantityDiscounts.filter((d) => !d.productId);
    const qtyByProduct = new Map<string, typeof quantityDiscounts>();
    for (const d of quantityDiscounts) {
      if (!d.productId) continue;
      const arr = qtyByProduct.get(d.productId) ?? [];
      arr.push(d);
      qtyByProduct.set(d.productId, arr);
    }

    let autoTotal = 0;
    let qtyTotal = 0;
    const outLines: PricingLineResult[] = lines.map((line) => {
      const auto = pickBestPerLine(autoByCat.get(line.categoryId) ?? [], line);
      const qtyCandidates = [
        ...(qtyByProduct.get(line.productId) ?? []),
        ...qtyStoreWide,
      ].filter((d) => line.quantity >= d.minQuantity);
      const qty = pickBestPerLine(qtyCandidates, line);

      const autoAmount = auto?.amount ?? 0;
      const qtyAmount = qty?.amount ?? 0;
      const lineDiscount = Math.min(line.lineTotal, round2(autoAmount + qtyAmount));
      autoTotal = round2(autoTotal + Math.min(line.lineTotal - qtyAmount, autoAmount));
      qtyTotal = round2(qtyTotal + qtyAmount);

      return {
        ...line,
        autoDiscountAmount: Math.min(line.lineTotal, autoAmount),
        quantityDiscountAmount: qtyAmount,
        lineDiscountAmount: lineDiscount,
        discountedLineTotal: round2(line.lineTotal - lineDiscount),
      };
    });

    const subtotalAfterItems = round2(
      outLines.reduce((s, l) => s + l.discountedLineTotal, 0)
    );

    let spendThreshold: AppliedSpendThresholdSummary | null = null;
    const applicableThresholds = thresholdDiscounts.filter(
      (d) => Number(d.minSubtotal) <= subtotalAfterItems
    );
    if (applicableThresholds.length > 0) {
      let best = { amount: 0, row: applicableThresholds[0] };
      for (const d of applicableThresholds) {
        const amount = discountAmountFor(d.type, Number(d.value), subtotalAfterItems);
        if (amount > best.amount) best = { amount, row: d };
      }
      if (best.amount > 0) {
        spendThreshold = {
          id: best.row.id,
          name: best.row.name,
          amount: round2(Math.min(best.amount, subtotalAfterItems)),
        };
      }
    }
    const thresholdAmount = spendThreshold?.amount ?? 0;
    const subtotalAfterThreshold = round2(subtotalAfterItems - thresholdAmount);

    let coupon: AppliedCouponSummary | null = null;
    if (couponCode && couponCode.trim()) {
      const applied = await this.applyCoupon(
        userId,
        couponCode.trim(),
        subtotalAfterThreshold
      );
      coupon = applied;
    }
    const couponAmount = coupon?.amount ?? 0;

    const totalDiscount = round2(
      outLines.reduce((s, l) => s + l.lineDiscountAmount, 0) +
        thresholdAmount +
        couponAmount
    );

    return {
      lines: outLines,
      subtotal,
      autoDiscountAmount: round2(autoTotal),
      quantityDiscountAmount: round2(qtyTotal),
      spendThresholdDiscountAmount: thresholdAmount,
      couponDiscountAmount: couponAmount,
      totalDiscount,
      coupon,
      spendThreshold,
    };
  }

  async applyCoupon(
    userId: string | null,
    code: string,
    eligibleSubtotal: number
  ): Promise<AppliedCouponSummary> {
    const normalized = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findFirst({
      where: { code: normalized, isActive: true, deletedAt: null },
    });
    if (!coupon) throw new AppError('Coupon not found or inactive', 404);
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      throw new AppError('Coupon has expired', 400);
    }
    if (coupon.minSubtotal && Number(coupon.minSubtotal) > eligibleSubtotal) {
      throw new AppError(
        `Order subtotal must be at least LKR ${Number(coupon.minSubtotal).toFixed(2)}`,
        400
      );
    }
    if (
      coupon.maxRedemptions !== null &&
      coupon.maxRedemptions !== undefined &&
      coupon.totalRedemptions >= coupon.maxRedemptions
    ) {
      throw new AppError('Coupon usage limit reached', 400);
    }
    if (coupon.perCustomerLimit && userId) {
      const used = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId },
      });
      if (used >= coupon.perCustomerLimit) {
        throw new AppError('You have already used this coupon', 400);
      }
    }
    const raw = discountAmountFor(coupon.type, Number(coupon.value), eligibleSubtotal);
    const amount = round2(Math.min(eligibleSubtotal, raw));
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type as 'FIXED' | 'PERCENT',
      amount,
      description: coupon.description,
    };
  }

  async recordRedemption(couponId: string, userId: string, orderId: string): Promise<void> {
    await prisma.$transaction([
      prisma.coupon.update({
        where: { id: couponId },
        data: { totalRedemptions: { increment: 1 } },
      }),
      prisma.couponRedemption.create({
        data: { couponId, userId, orderId },
      }),
    ]);
  }
}

function discountAmountFor(type: string, value: number, base: number): number {
  if (type === 'PERCENT') return round2((base * value) / 100);
  return round2(value);
}

function pickBestPerLine(
  discounts: Array<{ type: string; value: unknown }>,
  line: PricingLineInput
): { amount: number } | null {
  let best: { amount: number } | null = null;
  for (const d of discounts) {
    const per = discountAmountFor(d.type, Number(d.value), line.price);
    const amount = round2(Math.min(line.lineTotal, per * line.quantity));
    if (amount > 0 && (!best || amount > best.amount)) best = { amount };
  }
  return best;
}
