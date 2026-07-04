import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message }, 'Operational error');
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
