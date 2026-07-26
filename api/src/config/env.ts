import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  // Docker interpolates an unset `${ALLOWED_ORIGINS}` to '', which slips past
  // .default() (that only fires on undefined) and would otherwise boot with an
  // allowlist of [''] — silently rejecting every browser request. Normalise
  // each entry and refuse to start rather than fail opaquely at request time.
  // Trailing slashes are stripped: an Origin header is only ever
  // scheme://host[:port], so 'https://x.com/' would never match.
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((raw) =>
      raw
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean)
    )
    .refine((origins) => origins.length > 0, {
      message:
        'ALLOWED_ORIGINS is empty — every browser request would be blocked by CORS. ' +
        'Set it to a comma-separated list of origins, e.g. https://app.example.com',
    }),

  // Auth
  JWT_SECRET: z.string().min(32),
  // Same '' -> .default() gap as ALLOWED_ORIGINS above, but it fails later and
  // far less obviously: jose's setExpirationTime('') throws 'Invalid time
  // period format', so a *correct* password 500s while a wrong one still
  // returns 401 — the deployment looks healthy until someone signs in.
  JWT_EXPIRES_IN: z
    .string()
    .default('7d')
    .transform((raw) => raw.trim() || '7d'),

  // S3-compatible storage
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_PUBLIC_URL: z.string().url(),

  LOG_LEVEL: z.string().default('info'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z
    .string()
    .default('true')
    .transform((v) => v.toLowerCase() !== 'false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('KidPulse <orders@kidpulse.lk>'),
  WEB_BASE_URL: z.string().default('http://localhost:3000'),
  API_PUBLIC_URL: z.string().default('http://localhost:4000'),
  PAYHERE_MERCHANT_ID: z.string().optional(),
  PAYHERE_MERCHANT_SECRET: z.string().optional(),
  PAYHERE_SANDBOX: z
    .string()
    .default('true')
    .transform((v) => v.toLowerCase() !== 'false'),
});

export const env = schema.parse(process.env);
export const allowedOrigins = env.ALLOWED_ORIGINS;