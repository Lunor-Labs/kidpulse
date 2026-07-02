# Backend Security

## Authentication — JWT Pattern

```ts
// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { AppError } from './AppError';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): { sub: string } {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { sub: string };
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}

// src/middleware/auth.ts
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }
  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  req.userId = payload.sub;
  next();
}
```

**Rules:**
- Access token: short-lived (15 min), in `Authorization: Bearer` header
- Refresh token: longer-lived (7 days), in `HttpOnly` cookie — never in response body
- Rotate refresh tokens on use (one-time use)
- Store refresh token hash in DB for invalidation
- Use separate secrets for access and refresh tokens

## Authorization — RBAC

```ts
// src/middleware/authorize.ts
type Role = 'user' | 'admin' | 'moderator';

export function authorize(...allowedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !allowedRoles.includes(user.role as Role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    req.user = user;
    next();
  };
}

// Usage
router.delete('/:id', authenticate, authorize('admin'), controller.delete);
```

- Authenticate first, authorize second — always
- Return `403` for authorization failures (not `401`)
- Never expose role logic in client responses

## Rate Limiting

```ts
import { rateLimit } from 'express-rate-limit';

// General API limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Strict limit for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 attempts per 15 min
  skipSuccessfulRequests: true,
});

// Apply
app.use('/api/', apiLimiter);
app.use('/api/v1/auth/', authLimiter);
```

## Input Sanitization

```ts
import { z } from 'zod';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Always validate with Zod before processing
const schema = z.object({
  name: z.string().trim().min(1).max(200),
  // Reject strings that look like SQL injection attempts
  email: z.string().email().toLowerCase(),
});

// For user-generated HTML content only
const window = new JSDOM('').window;
const purify = DOMPurify(window);
const safeHtml = purify.sanitize(userHtmlInput);
```

**Rules:**
- Validate all input with Zod — Prisma prevents SQL injection for queries, but validate types/lengths
- Never use `eval()` or `Function()` with user input
- Trim strings at validation boundary
- For file uploads: validate MIME type server-side, not just extension

## CORS

```ts
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // required for cookies (refresh tokens)
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

Never use `cors({ origin: '*' })` in production — always whitelist specific origins.

## Helmet

```ts
import helmet from 'helmet';

// Apply first — before routes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

## Secrets Management

```bash
# .env (never commit)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_ACCESS_SECRET=<min 64 chars, random>
JWT_REFRESH_SECRET=<min 64 chars, different from access>
```

```ts
// src/config/env.ts — validate at startup
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(4000),
});

export const env = envSchema.parse(process.env);
```

**Rules:**
- Validate all env vars at startup — fail fast with clear error messages
- JWT secrets minimum 64 characters, generated with `openssl rand -base64 64`
- Never log secrets or tokens — sanitize objects before logging
- `.env` in `.gitignore` always — use `.env.example` as template
- In production: use a secrets manager (AWS Secrets Manager, Vault, etc.)

## Security Checklist

- [ ] Helmet applied before all routes
- [ ] CORS whitelist — no wildcard in production
- [ ] Rate limiting on all routes, stricter on auth
- [ ] All inputs validated with Zod at route boundary
- [ ] JWT secrets are long and random (≥ 64 chars)
- [ ] Refresh tokens are `HttpOnly` cookies — never in body
- [ ] No raw error messages in API responses
- [ ] `npm audit` — no high/critical vulnerabilities
- [ ] `DATABASE_URL` uses least-privilege DB user in production
- [ ] HTTPS enforced (handled by reverse proxy / cloud provider)
