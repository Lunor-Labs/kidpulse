import { NextFunction, Request, Response } from 'express';
import { AdminCustomerService } from '../services/AdminCustomerService';
import type { ReviewModerationInput } from '../types/adminSchemas';

export class AdminCustomerController {
  constructor(private service = new AdminCustomerService()) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.q === 'string' ? req.query.q : undefined;
      const limit =
        typeof req.query.limit === 'string' ? Number.parseInt(req.query.limit, 10) : undefined;
      const offset =
        typeof req.query.offset === 'string' ? Number.parseInt(req.query.offset, 10) : undefined;
      const result = await this.service.list({ search, limit, offset });
      res.json({ data: result });
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

  deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteReview(req.params.reviewId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  moderateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = res.locals.body as ReviewModerationInput;
      const row = await this.service.setReviewApproval(req.params.reviewId, body.isApproved);
      res.json({ data: row });
    } catch (error) {
      next(error);
    }
  };
}
