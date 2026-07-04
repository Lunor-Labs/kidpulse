import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../config/env';
import { AppError } from '../lib/AppError';
import type { AuthUser } from '../types/express';

const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
const ROLES: ReadonlyArray<AuthUser['role']> = ['customer', 'staff', 'super_admin'];

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }
  try {
    const { payload } = await jwtVerify(header.slice(7), secret);
    const meta = (payload.app_metadata ?? {}) as { role?: string };
    const role = ROLES.includes(meta.role as AuthUser['role']) ? (meta.role as AuthUser['role']) : 'customer';
    req.user = {
      id: payload.sub ?? '',
      email: typeof payload.email === 'string' ? payload.email : null,
      role,
    };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
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
