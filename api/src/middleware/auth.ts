import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/auth';
import { AppError } from '../lib/AppError';
import type { AuthUser } from '../types/express';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }
  try {
    const payload = await verifyToken(header.slice(7));
    req.user = {
      id: payload.sub ?? '',
      email: payload.email,
      fullName: payload.fullName ?? null,
      role: payload.role,
    } satisfies AuthUser;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }
  try {
    const payload = await verifyToken(header.slice(7));
    req.user = {
      id: payload.sub ?? '',
      email: payload.email,
      fullName: payload.fullName ?? null,
      role: payload.role,
    } satisfies AuthUser;
  } catch {
    /* fall through as guest */
  }
  next();
}

export function requireRole(...roles: Array<'staff' | 'super_admin'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as 'staff' | 'super_admin')) {
      next(new AppError('Forbidden', 403));
      return;
    }
    next();
  };
}

export function requireSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'super_admin') {
    next(new AppError('Super admin only', 403));
    return;
  }
  next();
}