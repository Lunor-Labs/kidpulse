import { NextFunction, Request, Response } from 'express';
import { ReviewService, ReviewSubmissionInput } from '../services/ReviewService';
import { AppError } from '../lib/AppError';

export class ReviewController {
  constructor(private service = new ReviewService()) {}

  submit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const input = res.locals.body as ReviewSubmissionInput;
      const review = await this.service.submit(req.user, req.params.productId, input);
      res.status(201).json({ data: review });
    } catch (error) {
      next(error);
    }
  };
}
