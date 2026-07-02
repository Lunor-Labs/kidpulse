# Backend Deployment

## Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml (local development)
version: '3.9'
services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/myapp
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Database Migrations in CI/CD

```bash
# Development — creates migration file + applies it
npx prisma migrate dev --name add_product_table

# Production — applies pending migrations only (no schema drift check)
npx prisma migrate deploy

# Never in production:
npx prisma migrate dev     # ❌ modifies migration history
npx prisma db push         # ❌ bypasses migration files
npx prisma migrate reset   # ❌ drops all data
```

**Rule:** Always run `prisma migrate deploy` as part of the deployment pipeline, **before** starting the application server. Never apply migrations manually in production.

## GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run migrations on test DB
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/testdb

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/testdb
          JWT_ACCESS_SECRET: ${{ secrets.JWT_ACCESS_SECRET_TEST }}
          JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_SECRET_TEST }}

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Trigger your cloud provider deployment here"
```

**Pipeline order:** generate → migrate → type-check → lint → test → build → deploy

## Health Check Endpoint

```ts
// Always available — no auth, no rate limit
app.get('/health', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: 'connected',
    });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});
```

Configure your cloud provider / load balancer to ping `/health` every 30 seconds. Return `503` if DB is unreachable.

## Environment Variables per Stage

| Variable | Development | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | Local PostgreSQL | Managed DB (RDS/Supabase/Neon) |
| `JWT_ACCESS_SECRET` | Any 64+ char string | Random, stored in secrets manager |
| `JWT_REFRESH_SECRET` | Any 64+ char string (different) | Random, stored in secrets manager |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | `https://yoursite.com` |
| `LOG_LEVEL` | `debug` | `info` |

## Production Checklist

### Performance
- [ ] Pino logging in production mode (JSON, no pretty-print)
- [ ] Database connection pool configured (`DATABASE_URL?connection_limit=10`)
- [ ] Prisma query logging disabled in production
- [ ] `NODE_ENV=production` set (enables Express optimizations)

### Security
- [ ] All secrets from secrets manager — not `.env` files on server
- [ ] Database user has least privilege (SELECT/INSERT/UPDATE/DELETE only — no DDL)
- [ ] HTTPS enforced by reverse proxy (nginx/ALB/Cloudflare)
- [ ] Rate limiting enabled
- [ ] CORS whitelist set to production domain only
- [ ] `npm audit` — no high/critical vulnerabilities

### Reliability
- [ ] `/health` endpoint responds with DB connectivity check
- [ ] Graceful shutdown: drain requests before `process.exit`
- [ ] `prisma migrate deploy` runs before application start
- [ ] Database backups enabled with point-in-time recovery
- [ ] Process manager configured (PM2, systemd, or container restart policy)

### Monitoring
- [ ] Structured logs (Pino JSON) shipped to log aggregator (Datadog/Logtail/CloudWatch)
- [ ] Error tracking configured (Sentry)
- [ ] Alerts on 5xx rate, response time P99, memory/CPU

## Graceful Shutdown

```ts
// src/server.ts
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Server started');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
  // Force shutdown after 10 seconds
  setTimeout(() => process.exit(1), 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```
