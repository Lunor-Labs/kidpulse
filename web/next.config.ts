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

// Product images are stored in the database as absolute URLs built from the
// API's `S3_PUBLIC_URL`, so the host serving them moves whenever the VPS or the
// storage endpoint moves. Hardcoding that host here means every move silently
// breaks every image on the site: uploading still works (that is the API, which
// is unaffected), but the Next image optimizer rejects an unlisted host with a
// 400 and each `<Image>` renders blank — no error, just nothing. So derive the
// allowlist from the same env the URLs are built from.
//
// `IMAGE_HOSTS` is a comma-separated escape hatch for any extra host still
// referenced by rows written before a move. Prefer pointing the API's
// `S3_PUBLIC_URL` at `<API_URL>/media` (the proxy in api/src/routes/media.ts)
// so image URLs stay under a host this config already knows about.
// Entries may be bare hostnames or full URLs. A bare hostname is assumed https,
// which is what every deployed host uses; http is only ever allowed for a value
// that spells it out, so a stray http URL in the database cannot downgrade an
// otherwise-https host.
type ImagePattern = { protocol: 'http' | 'https'; hostname: string };

function toPatterns(...values: (string | undefined)[]): ImagePattern[] {
  const seen = new Map<string, ImagePattern>();
  for (const raw of values.flatMap((value) => (value ?? '').split(','))) {
    const value = raw.trim();
    if (!value) continue;
    let url: URL;
    try {
      url = new URL(value.includes('://') ? value : `https://${value}`);
    } catch {
      continue;
    }
    const protocol = url.protocol === 'http:' ? 'http' : 'https';
    seen.set(`${protocol}//${url.hostname}`, { protocol, hostname: url.hostname });
  }
  return [...seen.values()];
}

const imagePatterns = toPatterns(API_URL, process.env.S3_PUBLIC_URL, process.env.IMAGE_HOSTS);

const nextConfig: NextConfig = {
  env: {
    API_URL,
    NEXT_PUBLIC_API_URL: API_URL,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Local Supabase storage, written by `npm run seed` against a local stack.
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      ...imagePatterns,
    ],
  },
};

export default nextConfig;
