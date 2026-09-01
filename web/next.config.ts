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
      { protocol: 'https', hostname: 'web-peuxf8afd0boyagnnycxwjck.51.79.165.223.sslip.io' },
      { protocol: 'https', hostname: 's3-peuxf8afd0boyagnnycxwjck.51.79.165.223.sslip.io' },
      { protocol: 'https', hostname: 'kidpulse-api.lunorlabs.com' },
    ],
  },
};

export default nextConfig;
