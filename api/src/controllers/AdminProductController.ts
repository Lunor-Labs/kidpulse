import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { UploadService } from '../services/UploadService';
import { ImageUploadInput, ProductUpsertInput } from '../types/adminSchemas';

export class AdminProductController {
  constructor(
    private productService = new ProductService(),
    private uploadService = new UploadService()
  ) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.productService.listForAdmin();
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await this.productService.getForAdmin(req.params.id);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  create = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as ProductUpsertInput;
      const row = await this.productService.create(body);
      res.status(201).json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as ProductUpsertInput;
      const row = await this.productService.update(req.params.id, body);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.productService.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  dashboard = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.productService.dashboardStats();
      res.json({ data: stats });
    } catch (error) {
      next(error);
    }
  };

  uploadImage = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as ImageUploadInput;
      const result = await this.uploadService.uploadImage(body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };
}
