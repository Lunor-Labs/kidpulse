import { NextFunction, Request, Response } from 'express';
import { WishlistService } from '../services/WishlistService';
import { AppError } from '../lib/AppError';

export class WishlistController {
  constructor(private service = new WishlistService()) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const items = await this.service.list(req.user);
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  };

  ids = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const ids = await this.service.ids(req.user);
      res.json({ data: ids });
    } catch (error) {
      next(error);
    }
  };

  toggle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { productId } = res.locals.body as { productId: string };
      const result = await this.service.toggle(req.user, productId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  };
}
