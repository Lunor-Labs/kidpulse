import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { PayHereService } from '../services/PayHereService';
import { prisma } from '../lib/prisma';

export class PaymentController {
  constructor(private payhere = new PayHereService()) {}

  payHereStart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderNumber = req.params.orderNumber;
      if (!orderNumber) throw new AppError('orderNumber required', 400);
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: { userId: true, shipEmail: true },
      });
      if (!order) throw new AppError('Order not found', 404);
      if (req.user && req.user.id !== order.userId) {
        throw new AppError('Order does not belong to this user', 403);
      }
      await prisma.order.update({
        where: { orderNumber },
        data: { paymentAttempts: { increment: 1 } },
      });
      const fields = await this.payhere.buildStartFields(orderNumber);
      res.json({ data: fields });
    } catch (error) {
      next(error);
    }
  };

  payHereNotify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.payhere.handleNotify(req.body ?? {});
      res.status(200).send('OK');
    } catch (error) {
      logger.warn({ error }, 'PayHere notify handler failed');
      next(error);
    }
  };

  bankTransferConfirmation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderNumber = req.params.orderNumber;
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: {
          orderNumber: true,
          total: true,
          currency: true,
          shipFullName: true,
          shipEmail: true,
          paymentMethod: true,
          userId: true,
        },
      });
      if (!order) throw new AppError('Order not found', 404);
      if (order.paymentMethod !== 'BANK_TRANSFER') {
        throw new AppError('Order is not a bank-transfer order', 400);
      }
      if (req.user && req.user.id !== order.userId) {
        throw new AppError('Order does not belong to this user', 403);
      }
      const settings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
      res.json({
        data: {
          order: {
            orderNumber: order.orderNumber,
            total: Number(order.total),
            currency: order.currency,
            customerName: order.shipFullName,
            email: order.shipEmail,
          },
          bank: {
            accountName: settings?.bankAccountName ?? null,
            bankName: settings?.bankName ?? null,
            branch: settings?.bankBranch ?? null,
            accountNumber: settings?.bankAccountNumber ?? null,
            whatsappNumber: settings?.whatsappNumber ?? null,
            deadlineDays: settings?.bankTransferDeadlineDays ?? 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
