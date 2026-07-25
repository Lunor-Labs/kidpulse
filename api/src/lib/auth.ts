import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../config/env';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface TokenPayload extends JWTPayload {
  email: string;
  role: 'customer' | 'staff' | 'super_admin';
  fullName?: string | null;
}

export async function signToken(payload: {
  sub: string;
  email: string;
  role: 'customer' | 'staff' | 'super_admin';
  fullName?: string | null;
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    fullName: payload.fullName ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}