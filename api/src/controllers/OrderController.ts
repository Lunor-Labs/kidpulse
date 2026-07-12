import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/AppError';
import { OrderService } from '../services/OrderService';
import { PromotionsService } from '../services/PromotionsService';
import type { CheckoutInput } from '../types/accountSchemas';

export class OrderController {
  constructor(
    private orderService = new OrderService(),
    private promotions = new PromotionsService()
  ) {}

  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as CheckoutInput;
      const user = req.user ?? null;
      const result = await this.orderService.checkout(user, body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const rows = await this.orderService.listForUser(req.user);
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  getByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const row = await this.orderService.getForUserByNumber(req.user, req.params.orderNumber);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as { code: string; subtotal: number };
      const userId = req.user?.id ?? null;
      const applied = await this.promotions.applyCoupon(userId, body.code, body.subtotal);
      res.json({
        data: {
          code: applied.code,
          type: applied.type,
          discountAmount: applied.amount,
          description: applied.description,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
