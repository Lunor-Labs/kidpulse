import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(32),
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
export const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
