import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ProductListQuery } from '../types/productQuery';

export class ProductController {
  constructor(private productService = new ProductService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.query as ProductListQuery;
      const products = await this.productService.getProducts(query);
      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  };
}
