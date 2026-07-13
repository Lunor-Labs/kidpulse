import { NextFunction, Request, Response } from 'express';
import { AdminCouponService } from '../services/AdminCouponService';
import type { CouponUpsertInput } from '../types/adminSchemas';

export class AdminCouponController {
  constructor(private service = new AdminCouponService()) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.service.list();
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await this.service.get(req.params.id);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  create = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as CouponUpsertInput;
      const row = await this.service.create(body);
      res.status(201).json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as CouponUpsertInput;
      const row = await this.service.update(req.params.id, body);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
