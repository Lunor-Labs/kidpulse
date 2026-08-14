import { NextFunction, Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { PromotionsService } from '../services/PromotionsService';
import { prisma } from '../lib/prisma';
import type { CheckoutInput, CartPreviewInput } from '../types/accountSchemas';

export class OrderController {
  constructor(
    private orderService = new OrderService(),
    private promotionsService = new PromotionsService()
  ) {}

  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as CheckoutInput;
      const result = await this.orderService.checkout(req.user ?? null, body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };

  validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, subtotal } = res.locals.body as { code: string; subtotal: number };
      const result = await this.promotionsService.applyCoupon(
        req.user?.id ?? null,
        code,
        subtotal
      );
      res.json({
        data: {
          code: result.code,
          type: result.type,
          discountAmount: result.amount,
          description: result.description,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  preview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as CartPreviewInput;

      // Fetch products to get categoryIds
      const products = await prisma.product.findMany({
        where: {
          id: { in: body.items.map((i) => i.productId) },
          deletedAt: null,
          isActive: true,
        },
        select: { id: true, categoryId: true, price: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      const lines = body.items.map((item) => {
        const product = byId.get(item.productId);
        if (!product) return null;
        const price = Number(product.price);
        const quantity = item.quantity;
        return {
          productId: product.id,
          categoryId: product.categoryId,
          price,
          quantity,
          lineTotal: Math.round(price * quantity * 100) / 100,
        };
      }).filter(Boolean) as Array<{
        productId: string;
        categoryId: string;
        price: number;
        quantity: number;
        lineTotal: number;
      }>;

      const pricing = await this.promotionsService.applyToCart(
        req.user?.id ?? null,
        lines,
        body.couponCode ?? null
      );

      res.json({
        data: {
          subtotal: pricing.subtotal,
          autoDiscountAmount: pricing.autoDiscountAmount,
          quantityDiscountAmount: pricing.quantityDiscountAmount,
          spendThresholdDiscountAmount: pricing.spendThresholdDiscountAmount,
          couponDiscountAmount: pricing.couponDiscountAmount,
          totalDiscount: pricing.totalDiscount,
          coupon: pricing.coupon
            ? {
                code: pricing.coupon.code,
                type: pricing.coupon.type,
                discountAmount: pricing.coupon.amount,
                description: pricing.coupon.description,
              }
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}