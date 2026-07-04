import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { AppError } from '../lib/AppError';

export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new AppError('Invalid query parameters', 400));
      return;
    }
    res.locals.query = result.data;
    next();
  };
}
