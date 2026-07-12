import path from 'node:path';
import dotenv from 'dotenv';
import type { NextConfig } from 'next';

// Load the shared root .env before Next.js reads process.env, so NEXT_PUBLIC_*
// values get inlined at build time from a single source of truth.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '54321', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

export default nextConfig;
