import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
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
  // A unique-constraint violation reaching here means an app-level duplicate
  // check missed it — usually because the conflicting row is soft-deleted and
  // so invisible to that check. It is a conflict, not a server fault, and a 500
  // here reads to the admin as "the app is broken" rather than "pick another
  // value".
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = err.meta?.target;
    const fields = Array.isArray(target) ? target.join(', ') : typeof target === 'string' ? target : null;
    logger.warn({ code: err.code, target }, 'Unique constraint violation');
    res.status(409).json({
      error: fields
        ? `A record with this ${fields} already exists.`
        : 'A record with these details already exists.',
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
