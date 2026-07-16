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

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.issues[0];
      next(new AppError(first ? first.message : 'Invalid request body', 400));
      return;
    }
    res.locals.body = result.data;
    next();
  };
}
