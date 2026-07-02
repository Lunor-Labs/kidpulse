# Frontend Deployment

## Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy preview
vercel

# Deploy production
vercel --prod
```

**`vercel.json` config:**
```json
{
  "framework": "nextjs",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    }
  ]
}
```

## Environment Variables per Stage

| Variable | Local | Preview | Production |
|---|---|---|---|
| `NEXTAUTH_URL` | `http://localhost:3000` | Preview URL (auto-set by Vercel) | `https://yoursite.com` |
| `NEXTAUTH_SECRET` | Any 32+ char string | Unique secret | Unique secret (rotate regularly) |
| `DATABASE_URL` | Local DB | Staging DB | Production DB |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Staging API | Production API |

**Rules:**
- Set all env vars in Vercel dashboard — never in `vercel.json`
- Separate database per environment (never share production DB with staging)
- Rotate secrets on any suspected breach immediately

## GitHub Actions CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test -- --run

      - name: Build
        run: npm run build
        env:
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Rules:**
- CI must pass before merging to `main`
- Run in order: type-check → lint → test → build
- Store secrets in GitHub repository secrets — never in workflow files
- Cache `node_modules` to speed up runs

## Production Checklist

### Performance
- [ ] Lighthouse score: Performance ≥ 90, SEO = 100, Accessibility ≥ 90
- [ ] All images use `next/image` with explicit dimensions
- [ ] Fonts loaded via `next/font`
- [ ] No unused dependencies in bundle: `npx @next/bundle-analyzer`
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### SEO
- [ ] Every page has unique `<title>` and `<meta description>`
- [ ] `app/sitemap.ts` returns all public URLs
- [ ] `app/robots.ts` configured correctly
- [ ] Open Graph tags set for social sharing
- [ ] Structured data (JSON-LD) on product/article pages

### Security
- [ ] Security headers configured in `next.config.ts`
- [ ] `npm audit` — no high/critical vulnerabilities
- [ ] All env vars validated at startup
- [ ] No secrets in client bundle (`NEXT_PUBLIC_` only for safe values)
- [ ] Auth routes protected via middleware

### Reliability
- [ ] `error.tsx` files for all major route segments
- [ ] `not-found.tsx` for 404 handling
- [ ] `loading.tsx` for route-level suspense
- [ ] E2E tests passing for critical flows (Playwright)

### Monitoring
- [ ] Error tracking configured (Sentry or similar)
- [ ] Analytics set up (Vercel Analytics or Plausible)
- [ ] Uptime monitoring on production URL

## Bundle Analysis

```bash
# Install
npm install --save-dev @next/bundle-analyzer

# next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default withBundleAnalyzer(nextConfig);

# Run
ANALYZE=true npm run build
```

Review for: large dependencies that could be dynamic-imported, duplicate packages, unused code.
