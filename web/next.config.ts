import path from 'node:path';
import dotenv from 'dotenv';
import type { NextConfig } from 'next';

// Load the shared root .env as a fallback. Next.js has already loaded web/.env
// by this point, and dotenv does not override existing values, so web/.env wins.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// `env` inlines these into the client bundle regardless of prefix, which is what
// lets browser code read `process.env.API_URL` without a NEXT_PUBLIC_ alias.
// `||` (not `??`) so a declared-but-blank var falls back instead of yielding ''.
const API_URL = process.env.API_URL?.trim().replace(/\/+$/, '') || 'http://localhost:4000';

const nextConfig: NextConfig = {
  env: { API_URL },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '54321', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 's3-ub46vtahora5iaoyry6x5pud.139.99.155.129.sslip.io' },
      { protocol: 'https', hostname: 'web-ub46vtahora5iaoyry6x5pud.139.99.155.129.sslip.io' },
      { protocol: 'https', hostname: 'kidpulse-api-dev.lunorlabs.com' },
    ],
  },
};

export default nextConfig;
