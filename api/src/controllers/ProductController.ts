import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ReviewService } from '../services/ReviewService';
import { ProductListQuery, ProductSearchQuery } from '../types/productQuery';

export class ProductController {
  constructor(
    private productService = new ProductService(),
    private reviewService = new ReviewService()
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.query as ProductListQuery;
      const products = await this.productService.getProducts(query);
      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  };

  search = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.query as ProductSearchQuery;
      const results = await this.productService.searchProducts(query);
      res.json({ data: results });
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.getProductBySlug(req.params.slug);
      res.json({ data: product });
    } catch (error) {
      next(error);
    }
  };

  getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await this.reviewService.getForProductSlug(req.params.slug);
      res.json({ data: reviews });
    } catch (error) {
      next(error);
    }
  };
}
