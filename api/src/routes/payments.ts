import { Router, urlencoded } from 'express';
import { optionalAuth } from '../middleware/auth';
import { PaymentController } from '../controllers/PaymentController';

export const paymentsRouter = Router();
const controller = new PaymentController();

paymentsRouter.post(
  '/payhere/start/:orderNumber',
  optionalAuth,
  controller.payHereStart
);

paymentsRouter.post(
  '/payhere/notify',
  urlencoded({ extended: false }),
  controller.payHereNotify
);

paymentsRouter.get(
  '/bank-transfer/:orderNumber',
  optionalAuth,
  controller.bankTransferConfirmation
);
