import { NextFunction, Request, Response } from 'express';
import { AdminDiscountService } from '../services/AdminDiscountService';
import type {
  AutoDiscountUpsertInput,
  QuantityDiscountUpsertInput,
  SpendThresholdUpsertInput,
} from '../types/adminSchemas';

export class AdminDiscountController {
  constructor(private service = new AdminDiscountService()) {}

  listAuto = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.service.listAuto() });
    } catch (e) {
      next(e);
    }
  };
  createAuto = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as AutoDiscountUpsertInput;
      res.status(201).json({ data: await this.service.createAuto(body) });
    } catch (e) {
      next(e);
    }
  };
  updateAuto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as AutoDiscountUpsertInput;
      res.json({ data: await this.service.updateAuto(req.params.id, body) });
    } catch (e) {
      next(e);
    }
  };
  removeAuto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.removeAuto(req.params.id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  };

  listQuantity = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.service.listQuantity() });
    } catch (e) {
      next(e);
    }
  };
  createQuantity = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as QuantityDiscountUpsertInput;
      res.status(201).json({ data: await this.service.createQuantity(body) });
    } catch (e) {
      next(e);
    }
  };
  updateQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as QuantityDiscountUpsertInput;
      res.json({ data: await this.service.updateQuantity(req.params.id, body) });
    } catch (e) {
      next(e);
    }
  };
  removeQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.removeQuantity(req.params.id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  };

  listSpend = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.service.listSpend() });
    } catch (e) {
      next(e);
    }
  };
  createSpend = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as SpendThresholdUpsertInput;
      res.status(201).json({ data: await this.service.createSpend(body) });
    } catch (e) {
      next(e);
    }
  };
  updateSpend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as SpendThresholdUpsertInput;
      res.json({ data: await this.service.updateSpend(req.params.id, body) });
    } catch (e) {
      next(e);
    }
  };
  removeSpend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.removeSpend(req.params.id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  };
}
