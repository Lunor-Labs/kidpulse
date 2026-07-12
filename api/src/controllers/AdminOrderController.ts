import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/AppError';
import { AdminOrderService } from '../services/AdminOrderService';
import { InvoiceService } from '../services/InvoiceService';
import type {
  BankPaymentActionInput,
  OrderShippingUpdateInput,
  OrderStatusUpdateInput,
} from '../types/adminSchemas';

export class AdminOrderController {
  constructor(
    private orderService = new AdminOrderService(),
    private invoiceService = new InvoiceService()
  ) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const search = typeof req.query.q === 'string' ? req.query.q : undefined;
      const limit =
        typeof req.query.limit === 'string' ? Number.parseInt(req.query.limit, 10) : undefined;
      const rows = await this.orderService.list({ status, search, limit });
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await this.orderService.getByNumber(req.params.orderNumber);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const body = res.locals.body as OrderStatusUpdateInput;
      const row = await this.orderService.updateStatus(
        req.params.id,
        body.status,
        req.user,
        body.note ?? null
      );
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  updateShipping = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const body = res.locals.body as OrderShippingUpdateInput;
      const row = await this.orderService.updateShipping(req.params.id, body, req.user);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  bankConfirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const row = await this.orderService.confirmBankPayment(req.params.id, req.user);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  bankCancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const body = res.locals.body as BankPaymentActionInput;
      const row = await this.orderService.cancelBankPayment(
        req.params.id,
        req.user,
        body?.note ?? null
      );
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  invoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.getForInvoice(req.params.orderNumber);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="invoice-${order.orderNumber}.pdf"`
      );
      this.invoiceService.streamInvoice(order, res);
    } catch (error) {
      next(error);
    }
  };

  packingSlip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.getForInvoice(req.params.orderNumber);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="packing-slip-${order.orderNumber}.pdf"`
      );
      this.invoiceService.streamPackingSlip(order, res);
    } catch (error) {
      next(error);
    }
  };
}
