# Frontend Security

## HTTP Security Headers

Configure in `next.config.ts`:

```ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // tighten after audit
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.yoursite.com",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

## Authentication — NextAuth / Auth.js v5

```ts
// auth.ts (project root)
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      async authorize(credentials) {
        // validate credentials, return user or null
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user; // protect all routes by default
    },
  },
});

// middleware.ts — protects routes at the edge
export { auth as middleware } from '@/auth';
export const config = { matcher: ['/dashboard/:path*', '/api/protected/:path*'] };
```

**Rules:**
- Never store sensitive data in JWT payload — use database sessions for sensitive apps
- Always set `NEXTAUTH_SECRET` in production (min 32 chars, random)
- Refresh tokens server-side only — never expose to client
- Session expiry: `maxAge: 30 * 24 * 60 * 60` (30 days max)

## XSS Prevention

```tsx
// ❌ Never — dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Sanitize first if HTML is required
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ React escapes text content automatically
<p>{userInput}</p>
```

- React escapes by default — only unsafe with `dangerouslySetInnerHTML`
- Use `dompurify` for any user-generated HTML rendering
- Validate/sanitize on the server too — never trust client-only validation

## Environment Variables

```bash
# .env.local (never commit)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...

# .env.example (commit this — no real values)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DATABASE_URL=
STRIPE_SECRET_KEY=
```

```ts
// src/config/env.ts — validate at startup with Zod
import { z } from 'zod';

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
});

export const env = envSchema.parse(process.env);
```

**Rules:**
- `NEXT_PUBLIC_` prefix only for values safe to expose to the browser
- Never log environment variables
- Validate all env vars at startup — fail fast with clear error messages
- `.env.local` in `.gitignore` always
- Use `.env.example` as the template for onboarding

## CSRF Protection

Next.js Route Handlers are not vulnerable to CSRF when using `SameSite=Lax` cookies (NextAuth default). For custom forms:

```ts
// Use the built-in Next.js CSRF token from Server Actions
// Or validate Origin header in Route Handlers
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin !== process.env.NEXTAUTH_URL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

## Dependency Security

```bash
# Run before every release
npm audit
npx next lint
```

- Keep dependencies updated — use Dependabot or Renovate
- Review `npm audit` output before deploying
- Never install packages with known high/critical vulnerabilities
