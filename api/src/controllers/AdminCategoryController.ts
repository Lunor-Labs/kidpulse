import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { CategoryUpsertInput } from '../types/adminSchemas';

export class AdminCategoryController {
  constructor(private categoryService = new CategoryService()) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.categoryService.listForAdmin();
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await this.categoryService.getForAdmin(req.params.id);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  create = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as CategoryUpsertInput;
      const row = await this.categoryService.create(body);
      res.status(201).json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as CategoryUpsertInput;
      const row = await this.categoryService.update(req.params.id, body);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.categoryService.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
