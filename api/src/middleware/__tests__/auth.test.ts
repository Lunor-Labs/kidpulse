import { NextFunction, Request, Response } from 'express';
import { SignJWT } from 'jose';
import { env } from '../../config/env';
import { AppError } from '../../lib/AppError';
import { authenticate, requireRole } from '../auth';

const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);

async function makeToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('user-123')
    .setExpirationTime('1h')
    .sign(secret);
}

function mockReqRes(authHeader?: string) {
  const req = { headers: { authorization: authHeader } } as Request;
  const res = {} as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('authenticate', () => {
  it('attaches user with default customer role for a valid token', async () => {
    const token = await makeToken({ email: 'a@b.lk' });
    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ id: 'user-123', email: 'a@b.lk', role: 'customer' });
  });

  it('reads role from app_metadata', async () => {
    const token = await makeToken({ email: 'a@b.lk', app_metadata: { role: 'super_admin' } });
    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await authenticate(req, res, next);
    expect(req.user?.role).toBe('super_admin');
  });

  it('rejects missing header with 401', async () => {
    const { req, res, next } = mockReqRes(undefined);
    await authenticate(req, res, next);
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
  });

  it('rejects a tampered token with 401', async () => {
    const { req, res, next } = mockReqRes('Bearer not-a-real-token');
    await authenticate(req, res, next);
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
  });
});

describe('requireRole', () => {
  it('allows listed roles and rejects others with 403', () => {
    const guard = requireRole('staff', 'super_admin');
    const pass = mockReqRes();
    pass.req.user = { id: 'u', email: 'a@b.lk', role: 'staff' };
    guard(pass.req, pass.res, pass.next);
    expect(pass.next).toHaveBeenCalledWith();

    const fail = mockReqRes();
    fail.req.user = { id: 'u', email: 'a@b.lk', role: 'customer' };
    guard(fail.req, fail.res, fail.next);
    const err = (fail.next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
  });
});
