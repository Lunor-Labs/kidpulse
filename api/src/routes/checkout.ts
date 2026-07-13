import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { OrderController } from '../controllers/OrderController';
import { checkoutSchema, couponValidateSchema } from '../types/accountSchemas';

export const checkoutRouter = Router();
const controller = new OrderController();

checkoutRouter.post(
  '/',
  optionalAuth,
  validateBody(checkoutSchema),
  controller.checkout
);
checkoutRouter.post(
  '/validate-coupon',
  validateBody(couponValidateSchema),
  controller.validateCoupon
);
