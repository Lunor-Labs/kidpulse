import { NextFunction, Request, Response } from 'express';
import { ProductBannerService } from '../services/ProductBannerService';
import { ProductBannerUpsertInput } from '../types/adminSchemas';

export class ProductBannerController {
  constructor(private service = new ProductBannerService()) {}

  getPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = String(req.query.productId ?? '').trim();
      if (!productId) {
        res.json({ data: null });
        return;
      }
      const row = await this.service.getForProduct(productId);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  listAdmin = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.service.listForAdmin();
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  getAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await this.service.getForAdmin(req.params.id);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  create = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as ProductBannerUpsertInput;
      const row = await this.service.create(body);
      res.status(201).json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as ProductBannerUpsertInput;
      const row = await this.service.update(req.params.id, body);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
