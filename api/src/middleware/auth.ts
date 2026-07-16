import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../config/env';
import { AppError } from '../lib/AppError';
import type { AuthUser } from '../types/express';

const jwks = createRemoteJWKSet(
  new URL(`${env.SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/.well-known/jwks.json`)
);
const hmacSecret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
const ROLES: ReadonlyArray<AuthUser['role']> = ['customer', 'staff', 'super_admin'];

async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, jwks);
    return payload;
  } catch {
    const { payload } = await jwtVerify(token, hmacSecret);
    return payload;
  }
}

function toAuthUser(payload: JWTPayload): AuthUser {
  const meta = (payload.app_metadata ?? {}) as { role?: string };
  const role = ROLES.includes(meta.role as AuthUser['role'])
    ? (meta.role as AuthUser['role'])
    : 'customer';
  // full_name is set by email sign-up and Google OAuth; name by some OAuth providers
  const userMeta = (payload.user_metadata ?? {}) as {
    full_name?: string;
    fullName?: string;
    name?: string;
  };
  const fullName = userMeta.full_name ?? userMeta.fullName ?? userMeta.name ?? null;
  return {
    id: payload.sub ?? '',
    email: typeof payload.email === 'string' ? payload.email : null,
    fullName: typeof fullName === 'string' && fullName.trim() ? fullName.trim() : null,
    role,
  };
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }
  try {
    req.user = toAuthUser(await verifyToken(header.slice(7)));
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
    req.user = toAuthUser(await verifyToken(header.slice(7)));
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

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'super_admin') {
    next(new AppError('Super admin only', 403));
    return;
  }
  next();
}
