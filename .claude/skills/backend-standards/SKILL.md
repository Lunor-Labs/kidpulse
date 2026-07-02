---
name: backend-standards
description: Use when building or modifying Express routes, controllers, services, repositories, Prisma schema, migrations, or auth — enforces industry-standard conventions for Node.js + Express + TypeScript + Prisma + PostgreSQL projects
---

# Backend Standards

Rigid skill — follow exactly. Auto-trigger when working on routes, controllers, services, repositories, migrations, or auth.

## Stack

Node.js 20+ · Express 4+ · TypeScript (strict) · Prisma ORM · PostgreSQL · Zod · Pino (logging) · Jest + Supertest (testing)

**Hard rules:**
- Single Prisma client instance — always import from `src/lib/prisma.ts`
- Never write raw SQL — use Prisma query API
- All routes go through validation middleware (Zod) before controllers
- No `console.log` — use the `logger` from `src/lib/logger.ts`
- No `any` types — strict TypeScript throughout

## Folder Structure

```
src/
  routes/           # Express routers — wiring only (no logic)
  controllers/      # Handle req/res — call services, return responses
  services/         # Business logic — call repositories
  repositories/     # Data access — Prisma queries only
  middleware/       # Auth, validation, error handling, rate limiting
  lib/
    prisma.ts       # Singleton Prisma client
    logger.ts       # Pino logger instance
  types/            # Shared TypeScript interfaces
  config/           # Env validation (Zod), constants
  utils/            # Pure helper functions
prisma/
  schema.prisma     # Database schema
  migrations/       # Auto-generated migration files
```

## Express Setup

```ts
// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { productRouter } from './routes/products';

export const app = express();

// Middleware — order matters
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/v1/products', productRouter);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler — must be last
app.use(errorHandler);
```

## Layer Architecture

```
Request → Route → Middleware (auth, validate) → Controller → Service → Repository → Prisma → DB
```

```ts
// routes/products.ts — wiring only
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema } from '../types/product';
import { ProductController } from '../controllers/ProductController';

export const productRouter = Router();
const controller = new ProductController();

productRouter.get('/', controller.getAll);
productRouter.post('/', authenticate, validate(createProductSchema), controller.create);
```

```ts
// controllers/ProductController.ts — handle req/res only
export class ProductController {
  constructor(private productService = new ProductService()) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.getAllProducts();
      res.json({ data: products });
    } catch (error) {
      next(error); // always delegate to error handler
    }
  };
}
```

```ts
// services/ProductService.ts — business logic only
export class ProductService {
  constructor(private productRepo = new ProductRepository()) {}

  async getAllProducts(): Promise<Product[]> {
    logger.info('Fetching all products');
    const start = Date.now();
    try {
      const products = await this.productRepo.findAll();
      logger.info({ count: products.length, ms: Date.now() - start }, 'Products fetched');
      return products;
    } catch (error) {
      logger.error({ error }, 'Failed to fetch products');
      throw new AppError('Unable to load products', 500);
    }
  }
}
```

```ts
// repositories/ProductRepository.ts — Prisma queries only
export class ProductRepository {
  async findAll(): Promise<Product[]> {
    return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async create(data: CreateProductInput): Promise<Product> {
    return prisma.product.create({ data });
  }
}
```

## Prisma Setup

```ts
// src/lib/prisma.ts — singleton client
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query', 'error', 'warn'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Prisma schema conventions:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")        // snake_case table names
}
```

**Prisma rules:**
- Use `cuid()` for IDs — portable and collision-resistant
- Always include `createdAt` and `updatedAt` on every model
- `@@map` for snake_case table names
- Run `npx prisma generate` after every schema change
- Run `npx prisma migrate dev` during development — never `db push` in production
- `npx prisma migrate deploy` in production CI/CD

## TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

## Error Handling

```ts
// src/lib/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
  }
}

// src/middleware/errorHandler.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message }, 'Operational error');
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Unexpected errors
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
```

**Rules:**
- Controllers always `catch (error) { next(error) }` — never send 500 from controller
- Services throw `AppError` for known failure cases
- Never expose raw error messages or stack traces to clients
- Log full error details server-side, send safe message to client

## Logging with Pino

```ts
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
});
```

**Log levels:**
- `logger.info` — start of every operation
- `logger.info` with `{ ms, count }` — success with performance data
- `logger.warn` — operational errors (bad request, not found)
- `logger.error` — unexpected failures (always include `{ error }`)
- Never `console.log` in application code

## Testing

```ts
// src/services/__tests__/ProductService.test.ts
describe('ProductService.getAllProducts', () => {
  it('returns all products', async () => {
    const mockRepo = { findAll: jest.fn().mockResolvedValue([mockProduct]) };
    const service = new ProductService(mockRepo as any);

    const result = await service.getAllProducts();

    expect(result).toHaveLength(1);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });
});

// src/routes/__tests__/products.test.ts — integration
describe('GET /api/v1/products', () => {
  it('returns 200 with products list', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});
```

**Stack:** Jest + Supertest + `@prisma/client/testing` (mock PrismaClient)

**Rules:**
- Unit test services with mocked repositories
- Integration test routes end-to-end with a test database
- Test database: separate `DATABASE_URL_TEST` env var
- Reset database state between tests: `prisma.$executeRaw` or transaction rollback

See `api-design.md`, `security.md`, and `deployment.md` for API conventions, security, and CI/CD standards.
