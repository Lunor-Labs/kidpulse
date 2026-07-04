import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  constructor(private categoryService = new CategoryService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getCategories();
      res.json({ data: categories });
    } catch (error) {
      next(error);
    }
  };
}
