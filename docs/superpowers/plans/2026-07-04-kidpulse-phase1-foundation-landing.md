# KidPulse Phase 1 — Foundation + Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the KidPulse e-commerce foundation (Express API + Next.js web + local Supabase) and ship a fully working, data-driven landing page.

**Architecture:** Two apps in one repo: `api/` (Express + TypeScript + Prisma, layered routes→controllers→services→repositories, only thing that touches Postgres) and `web/` (Next.js App Router, Server Components fetch from the API with ISR). Local Supabase CLI stack provides Postgres + Storage; seed script uploads real product photos to Storage.

**Tech Stack:** Node 20+, Express 4, TypeScript strict, Prisma, Zod, Pino, Jest+Supertest, jose · Next.js (App Router), Tailwind CSS v4, Zustand, sonner, Vitest+RTL · Supabase CLI (Docker).

**Spec:** `docs/superpowers/specs/2026-07-04-kidpulse-phase1-foundation-landing-design.md`

## Global Constraints

- Follow `.claude/skills/backend-standards` and `.claude/skills/frontend-standards` exactly (layering, naming, file-size limits, no `any`, named exports, no inline styles, `use client` pushed down).
- API responses: success `{ data }`, failure `{ error }` (safe message only). Routes versioned under `/api/v1`.
- Prisma: cuid IDs, `createdAt`/`updatedAt` on every model, `@@map` snake_case table names, single client from `src/lib/prisma.ts`, no raw SQL.
- No `console.log` in API code — Pino `logger` only.
- Brand tokens (never hardcode hex in components): indigo `#1b0b80`, indigo-deep `#130860`, sky `#38b6ff`, sky-deep `#1d9eed`, gold `#ffc300`, gold-deep `#e8af00`, berry `#ed3f7f`, berry-deep `#d12d68`, cream `#fff4e0`, paper `#fffdf8`, ink `#1c1530`, ink-soft `#5d5775`, line `#ece7f5`, olive `#8fb821`.
- Fonts: Baloo 2 (display) + Fredoka (body) via `next/font`.
- Currency format everywhere: `Rs. 2,500` (`formatPrice`, en-US grouping).
- Frontend never sends prices to the API; cart-stored price is display-only.
- `.env` files are never committed; every env var appears in the app's `.env.example`.
- API dev port **4000**; web dev port **3000**; local Supabase API **54321**, Postgres **54322**.
- Commit after every task (each task's final step).

**Repo paths referenced by seed/assets:**
- Photos: `design/Photos-20260704T020151Z-3-001/Photos/`
- Branding: `design/Branding Materials-20260704T020142Z-3-001/Branding Materials/`

---

### Task 1: Supabase local stack + repo hygiene

**Files:**
- Create: `supabase/config.toml` (generated), `.gitignore` (extend), `README.md` (replace stub)

**Interfaces:**
- Produces: running local stack — API URL `http://127.0.0.1:54321`, DB URL `postgresql://postgres:postgres@127.0.0.1:54322/postgres`, plus printed `anon key`, `service_role key`, `JWT secret` used by Tasks 2, 6, 7.

- [ ] **Step 1: Install/verify Supabase CLI and Docker**

Run: `supabase --version && docker info --format '{{.ServerVersion}}'`
Expected: version numbers. If CLI missing: `npm install -g supabase` (or `brew install supabase/tap/supabase`).

- [ ] **Step 2: Initialize Supabase project**

Run from repo root: `supabase init`
Expected: `supabase/config.toml` created. Do not enable Deno/functions prompts (answer N).

- [ ] **Step 3: Start local stack and record credentials**

Run: `supabase start`
Expected output includes `API URL: http://127.0.0.1:54321`, `DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres`, `anon key: ...`, `service_role key: ...`, `JWT secret: ...`. Save these values for later tasks (they are stable per-machine defaults).

- [ ] **Step 4: Update .gitignore**

Append to `.gitignore` (create if absent):

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
.next/
coverage/
supabase/.temp/
supabase/.branches/
```

- [ ] **Step 5: Replace README.md with project overview**

```markdown
# KidPulse

E-commerce storefront for KidPulse craft kits (Lunor Labs).

## Structure
- `web/` — Next.js storefront (port 3000)
- `api/` — Express + Prisma API (port 4000)
- `supabase/` — local Supabase stack config (Docker)
- `docs/` — specs and implementation plans
- `design/` — client-provided design reference and assets

## Local development
1. `supabase start` (Docker required) — Postgres on 54322, Storage/API on 54321
2. `cd api && cp .env.example .env` — fill values from `supabase start` output, then `npm install && npx prisma migrate dev && npm run seed && npm run dev`
3. `cd web && cp .env.example .env && npm install && npm run dev`
```

- [ ] **Step 6: Commit**

```bash
git add .gitignore README.md supabase/
git commit -m "chore: add local Supabase stack and repo hygiene"
```

---

### Task 2: API scaffold with health endpoint (TDD)

**Files:**
- Create: `api/package.json`, `api/tsconfig.json`, `api/jest.config.js`, `api/.env.example`, `api/src/config/env.ts`, `api/src/lib/logger.ts`, `api/src/lib/AppError.ts`, `api/src/lib/prisma.ts`, `api/src/middleware/errorHandler.ts`, `api/src/app.ts`, `api/src/server.ts`
- Test: `api/src/routes/__tests__/health.test.ts`

**Interfaces:**
- Produces: `app` (Express instance, no listener) exported from `api/src/app.ts`; `env` object `{ PORT, DATABASE_URL, ALLOWED_ORIGINS, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET }` from `src/config/env.ts`; `logger`, `AppError(message, statusCode, isOperational?)`, `prisma` singleton, `errorHandler` middleware. All later API tasks import these.

- [ ] **Step 1: Create api/package.json**

```json
{
  "name": "kidpulse-api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --runInBand",
    "seed": "tsx prisma/seed.ts",
    "lint": "tsc --noEmit"
  },
  "prisma": { "seed": "tsx prisma/seed.ts" }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd api
npm install express@4 cors helmet express-rate-limit zod pino dotenv jose @prisma/client @supabase/supabase-js
npm install -D typescript tsx prisma pino-pretty jest ts-jest supertest @types/express@4 @types/cors @types/supertest @types/node @types/jest
```

Expected: no peer-dependency errors.

- [ ] **Step 3: Create api/tsconfig.json and api/jest.config.js**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node", "jest"]
  },
  "include": ["src"]
}
```

```js
// api/jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
```

```js
// api/jest.setup.js
require('dotenv').config();
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}
```

- [ ] **Step 4: Create api/.env.example**

```bash
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
DATABASE_URL_TEST=postgresql://postgres:postgres@127.0.0.1:54322/kidpulse_test
ALLOWED_ORIGINS=http://localhost:3000
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<from `supabase start` output>
SUPABASE_JWT_SECRET=<from `supabase start` output>
LOG_LEVEL=info
```

Copy to `api/.env` and fill the two Supabase values from Task 1 Step 3.

- [ ] **Step 5: Write failing health test**

```ts
// api/src/routes/__tests__/health.test.ts
import request from 'supertest';
import { app } from '../../app';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd api && npx jest src/routes/__tests__/health.test.ts`
Expected: FAIL — cannot find module '../../app'.

- [ ] **Step 7: Implement config, libs, middleware, app, server**

```ts
// api/src/config/env.ts
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.string().default('info'),
});

export const env = schema.parse(process.env);
export const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
```

```ts
// api/src/lib/logger.ts
import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
});
```

```ts
// api/src/lib/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
  }
}
```

```ts
// api/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error', 'warn'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

```ts
// api/src/middleware/errorHandler.ts
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message }, 'Operational error');
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
```

```ts
// api/src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { allowedOrigins } from './config/env';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);
```

```ts
// api/src/server.ts
import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'API listening');
});
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd api && npx jest src/routes/__tests__/health.test.ts`
Expected: PASS (1 test). Note: rate-limit middleware allows 100 req/15min — fine for tests.

- [ ] **Step 9: Verify dev server boots**

Run: `cd api && npm run dev` (then Ctrl-C after output)
Expected: log line `API listening` with `port: 4000`. `curl http://localhost:4000/health` returns `{"status":"ok",...}`.

- [ ] **Step 10: Commit**

```bash
git add api/
git commit -m "feat(api): scaffold Express app with health endpoint, config, logging, error handling"
```

---

### Task 3: Prisma schema, migration, test database

**Files:**
- Create: `api/prisma/schema.prisma`, `api/src/types/dto.ts`, `api/src/tests-helpers/db.ts`
- Modify: `api/package.json` (add script)

**Interfaces:**
- Produces: Prisma models `Category`, `Product`, `ProductImage`; DTO interfaces `CategoryDto`, `ProductDto`, `ProductImageDto` (in `src/types/dto.ts`) consumed by Tasks 4, 5; test helper `resetDb()` and fixture builders `createCategory(data?)`, `createProduct(categoryId, data?)` consumed by Tasks 4, 5 integration tests.

- [ ] **Step 1: Write schema**

```prisma
// api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]

  @@map("categories")
}

model Product {
  id             String         @id @default(cuid())
  name           String
  slug           String         @unique
  description    String
  price          Decimal        @db.Decimal(10, 2)
  compareAtPrice Decimal?       @db.Decimal(10, 2)
  sku            String         @unique
  stockQuantity  Int            @default(0)
  ageRangeMin    Int?
  ageRangeMax    Int?
  isFeatured     Boolean        @default(false)
  isBestSeller   Boolean        @default(false)
  isActive       Boolean        @default(true)
  categoryId     String
  category       Category       @relation(fields: [categoryId], references: [id])
  images         ProductImage[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([categoryId])
  @@map("products")
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  altText   String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("product_images")
}
```

- [ ] **Step 2: Run the migration against dev DB**

```bash
cd api && npx prisma migrate dev --name init_catalog
```

Expected: migration created under `api/prisma/migrations/`, `prisma generate` runs, tables exist. Verify: `npx prisma db pull --print` shows the three tables.

- [ ] **Step 3: Create test database and migrate it**

Add script to `api/package.json` scripts:

```json
"test:db:setup": "docker exec supabase_db_kidpulse psql -U postgres -c 'CREATE DATABASE kidpulse_test' || true && DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/kidpulse_test npx prisma migrate deploy"
```

Run: `cd api && npm run test:db:setup`
Expected: `kidpulse_test` DB exists with all migrations applied. (Container name is `supabase_db_<project-dir>`; confirm with `docker ps --format '{{.Names}}' | grep supabase_db`.)

- [ ] **Step 4: Create DTO types**

```ts
// api/src/types/dto.ts
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

export interface ProductImageDto {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stockQuantity: number;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  category: { id: string; name: string; slug: string };
  images: ProductImageDto[];
}
```

- [ ] **Step 5: Create test DB helpers**

```ts
// api/src/tests-helpers/db.ts
import { prisma } from '../lib/prisma';

export async function resetDb(): Promise<void> {
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

let n = 0;

export async function createCategory(data: Partial<{ name: string; slug: string; sortOrder: number; isActive: boolean }> = {}) {
  n += 1;
  return prisma.category.create({
    data: { name: `Cat ${n}`, slug: `cat-${n}`, sortOrder: n, ...data },
  });
}

export async function createProduct(
  categoryId: string,
  data: Partial<{
    name: string; slug: string; sku: string; price: number; compareAtPrice: number;
    isBestSeller: boolean; isFeatured: boolean; isActive: boolean; stockQuantity: number;
    ageRangeMin: number; ageRangeMax: number;
  }> = {}
) {
  n += 1;
  return prisma.product.create({
    data: {
      name: `Product ${n}`, slug: `product-${n}`, sku: `SKU-${n}`,
      description: 'Test product', price: 1000, stockQuantity: 10, categoryId,
      ...data,
    },
  });
}
```

- [ ] **Step 6: Typecheck and commit**

```bash
cd api && npm run lint
git add api/prisma api/src/types api/src/tests-helpers api/package.json
git commit -m "feat(api): add catalog schema, migration, DTOs and test DB helpers"
```

---

### Task 4: Categories endpoint (TDD)

**Files:**
- Create: `api/src/repositories/CategoryRepository.ts`, `api/src/services/CategoryService.ts`, `api/src/controllers/CategoryController.ts`, `api/src/routes/categories.ts`
- Modify: `api/src/app.ts` (mount router)
- Test: `api/src/routes/__tests__/categories.test.ts`, `api/src/services/__tests__/CategoryService.test.ts`

**Interfaces:**
- Consumes: `prisma`, `AppError`, `logger`, DTOs, `resetDb`/`createCategory`/`createProduct` (Task 3).
- Produces: `GET /api/v1/categories` → `{ data: CategoryDto[] }` ordered by `sortOrder` asc, only `isActive` categories, `productCount` counts only active products. `CategoryService.getCategories(): Promise<CategoryDto[]>`.

- [ ] **Step 1: Write failing integration test**

```ts
// api/src/routes/__tests__/categories.test.ts
import request from 'supertest';
import { app } from '../../app';
import { resetDb, createCategory, createProduct } from '../../tests-helpers/db';
import { prisma } from '../../lib/prisma';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('GET /api/v1/categories', () => {
  it('returns active categories ordered by sortOrder with active product counts', async () => {
    const painting = await createCategory({ name: 'Painting Kits', slug: 'painting-kits', sortOrder: 1 });
    await createCategory({ name: 'STEM Kits', slug: 'stem-kits', sortOrder: 2 });
    await createCategory({ name: 'Hidden', slug: 'hidden', isActive: false });
    await createProduct(painting.id);
    await createProduct(painting.id, { isActive: false });

    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].slug).toBe('painting-kits');
    expect(res.body.data[0].productCount).toBe(1);
    expect(res.body.data[1].productCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && npx jest categories.test`
Expected: FAIL — 404 (router not mounted / modules missing).

- [ ] **Step 3: Implement repository → service → controller → route**

```ts
// api/src/repositories/CategoryRepository.ts
import { prisma } from '../lib/prisma';

export class CategoryRepository {
  async findActiveWithCounts() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
  }
}
```

```ts
// api/src/services/CategoryService.ts
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CategoryDto } from '../types/dto';

export class CategoryService {
  constructor(private categoryRepo = new CategoryRepository()) {}

  async getCategories(): Promise<CategoryDto[]> {
    const start = Date.now();
    try {
      const categories = await this.categoryRepo.findActiveWithCounts();
      logger.info({ count: categories.length, ms: Date.now() - start }, 'Categories fetched');
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
        productCount: c._count.products,
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch categories');
      throw new AppError('Unable to load categories', 500);
    }
  }
}
```

```ts
// api/src/controllers/CategoryController.ts
import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  constructor(private categoryService = new CategoryService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getCategories();
      res.json({ data: categories });
    } catch (error) {
      next(error);
    }
  };
}
```

```ts
// api/src/routes/categories.ts
import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

export const categoryRouter = Router();
const controller = new CategoryController();

categoryRouter.get('/', controller.getAll);
```

In `api/src/app.ts`, after the rate-limit middleware and before `/health`, add:

```ts
import { categoryRouter } from './routes/categories';
// ...
app.use('/api/v1/categories', categoryRouter);
```

- [ ] **Step 4: Run integration test to verify it passes**

Run: `cd api && npx jest categories.test`
Expected: PASS.

- [ ] **Step 5: Write + run service unit test (mocked repo)**

```ts
// api/src/services/__tests__/CategoryService.test.ts
import { CategoryService } from '../CategoryService';
import { AppError } from '../../lib/AppError';

const row = {
  id: 'c1', name: 'Painting Kits', slug: 'painting-kits', description: null,
  imageUrl: null, sortOrder: 1, isActive: true, createdAt: new Date(),
  updatedAt: new Date(), _count: { products: 3 },
};

describe('CategoryService.getCategories', () => {
  it('maps rows to DTOs with productCount', async () => {
    const repo = { findActiveWithCounts: jest.fn().mockResolvedValue([row]) };
    const service = new CategoryService(repo as never);
    const result = await service.getCategories();
    expect(result).toEqual([
      { id: 'c1', name: 'Painting Kits', slug: 'painting-kits', description: null, imageUrl: null, sortOrder: 1, productCount: 3 },
    ]);
  });

  it('wraps repository failures in AppError 500', async () => {
    const repo = { findActiveWithCounts: jest.fn().mockRejectedValue(new Error('db down')) };
    const service = new CategoryService(repo as never);
    await expect(service.getCategories()).rejects.toThrow(AppError);
  });
});
```

Run: `cd api && npx jest CategoryService`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add api/src
git commit -m "feat(api): categories endpoint with product counts"
```

---

### Task 5: Products endpoint with validated query params (TDD)

**Files:**
- Create: `api/src/middleware/validate.ts`, `api/src/types/productQuery.ts`, `api/src/repositories/ProductRepository.ts`, `api/src/services/ProductService.ts`, `api/src/controllers/ProductController.ts`, `api/src/routes/products.ts`
- Modify: `api/src/app.ts` (mount router)
- Test: `api/src/routes/__tests__/products.test.ts`, `api/src/services/__tests__/ProductService.test.ts`

**Interfaces:**
- Consumes: Task 2 libs, Task 3 DTOs/helpers.
- Produces: `GET /api/v1/products?bestseller=&featured=&categoryId=&limit=` → `{ data: ProductDto[] }` (active only, newest first, images sorted by sortOrder, `price`/`compareAtPrice` as numbers). Invalid query → 400 `{ error: 'Invalid query parameters' }`. `validateQuery(schema)` middleware puts parsed values on `res.locals.query` — reused by every future list endpoint. `ProductListQuery` type `{ bestseller?: boolean; featured?: boolean; categoryId?: string; limit: number }`.

- [ ] **Step 1: Write failing integration tests**

```ts
// api/src/routes/__tests__/products.test.ts
import request from 'supertest';
import { app } from '../../app';
import { resetDb, createCategory, createProduct } from '../../tests-helpers/db';
import { prisma } from '../../lib/prisma';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('GET /api/v1/products', () => {
  it('returns active products with numeric prices and category', async () => {
    const cat = await createCategory({ slug: 'painting-kits', name: 'Painting Kits' });
    await createProduct(cat.id, { price: 2500, compareAtPrice: 12690 });
    await createProduct(cat.id, { isActive: false });

    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].price).toBe(2500);
    expect(res.body.data[0].compareAtPrice).toBe(12690);
    expect(res.body.data[0].category.slug).toBe('painting-kits');
  });

  it('filters by bestseller and respects limit', async () => {
    const cat = await createCategory();
    await createProduct(cat.id, { isBestSeller: true });
    await createProduct(cat.id, { isBestSeller: true });
    await createProduct(cat.id, { isBestSeller: false });

    const res = await request(app).get('/api/v1/products?bestseller=true&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].isBestSeller).toBe(true);
  });

  it('rejects invalid limit with 400', async () => {
    const res = await request(app).get('/api/v1/products?limit=999');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid query parameters');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd api && npx jest products.test`
Expected: FAIL — 404.

- [ ] **Step 3: Implement query schema + validate middleware**

```ts
// api/src/types/productQuery.ts
import { z } from 'zod';

export const productListQuerySchema = z.object({
  bestseller: z.enum(['true', 'false']).optional().transform((v) => v === undefined ? undefined : v === 'true'),
  featured: z.enum(['true', 'false']).optional().transform((v) => v === undefined ? undefined : v === 'true'),
  categoryId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
```

```ts
// api/src/middleware/validate.ts
import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../lib/AppError';

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new AppError('Invalid query parameters', 400));
      return;
    }
    res.locals.query = result.data;
    next();
  };
}
```

- [ ] **Step 4: Implement repository → service → controller → route**

```ts
// api/src/repositories/ProductRepository.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ProductListQuery } from '../types/productQuery';

export class ProductRepository {
  async findMany(query: ProductListQuery) {
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (query.bestseller !== undefined) where.isBestSeller = query.bestseller;
    if (query.featured !== undefined) where.isFeatured = query.featured;
    if (query.categoryId) where.categoryId = query.categoryId;

    return prisma.product.findMany({
      where,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }
}
```

```ts
// api/src/services/ProductService.ts
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProductDto } from '../types/dto';
import { ProductListQuery } from '../types/productQuery';

export class ProductService {
  constructor(private productRepo = new ProductRepository()) {}

  async getProducts(query: ProductListQuery): Promise<ProductDto[]> {
    const start = Date.now();
    try {
      const products = await this.productRepo.findMany(query);
      logger.info({ count: products.length, ms: Date.now() - start }, 'Products fetched');
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice === null ? null : Number(p.compareAtPrice),
        sku: p.sku,
        stockQuantity: p.stockQuantity,
        ageRangeMin: p.ageRangeMin,
        ageRangeMax: p.ageRangeMax,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        category: p.category,
        images: p.images.map((i) => ({ id: i.id, url: i.url, altText: i.altText, sortOrder: i.sortOrder })),
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch products');
      throw new AppError('Unable to load products', 500);
    }
  }
}
```

```ts
// api/src/controllers/ProductController.ts
import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ProductListQuery } from '../types/productQuery';

export class ProductController {
  constructor(private productService = new ProductService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.query as ProductListQuery;
      const products = await this.productService.getProducts(query);
      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  };
}
```

```ts
// api/src/routes/products.ts
import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { validateQuery } from '../middleware/validate';
import { productListQuerySchema } from '../types/productQuery';

export const productRouter = Router();
const controller = new ProductController();

productRouter.get('/', validateQuery(productListQuerySchema), controller.getAll);
```

In `api/src/app.ts` next to the categories mount:

```ts
import { productRouter } from './routes/products';
// ...
app.use('/api/v1/products', productRouter);
```

- [ ] **Step 5: Run integration tests to verify they pass**

Run: `cd api && npx jest products.test`
Expected: PASS (3 tests).

- [ ] **Step 6: Write + run service unit test**

```ts
// api/src/services/__tests__/ProductService.test.ts
import { Prisma } from '@prisma/client';
import { ProductService } from '../ProductService';

const row = {
  id: 'p1', name: 'Kit', slug: 'kit', description: 'd',
  price: new Prisma.Decimal(2500), compareAtPrice: new Prisma.Decimal(12690),
  sku: 'SKU-1', stockQuantity: 5, ageRangeMin: 3, ageRangeMax: 10,
  isFeatured: false, isBestSeller: true, isActive: true, categoryId: 'c1',
  createdAt: new Date(), updatedAt: new Date(),
  category: { id: 'c1', name: 'Painting Kits', slug: 'painting-kits' },
  images: [],
};

describe('ProductService.getProducts', () => {
  it('converts Decimal prices to numbers', async () => {
    const repo = { findMany: jest.fn().mockResolvedValue([row]) };
    const service = new ProductService(repo as never);
    const result = await service.getProducts({ limit: 12 });
    expect(result[0].price).toBe(2500);
    expect(result[0].compareAtPrice).toBe(12690);
  });
});
```

Run: `cd api && npx jest ProductService`
Expected: PASS.

- [ ] **Step 7: Run the full API suite, then commit**

Run: `cd api && npm test`
Expected: all suites pass.

```bash
git add api/src
git commit -m "feat(api): products endpoint with validated query filters"
```

---

### Task 6: Supabase JWT auth middleware (TDD, not yet mounted)

**Files:**
- Create: `api/src/middleware/auth.ts`, `api/src/types/express.d.ts`
- Modify: `api/tsconfig.json` (include the .d.ts)
- Test: `api/src/middleware/__tests__/auth.test.ts`

**Interfaces:**
- Consumes: `env.SUPABASE_JWT_SECRET`, `AppError`.
- Produces: `authenticate` middleware — verifies `Authorization: Bearer <jwt>` (HS256, Supabase local default; swap to JWKS when a cloud project uses asymmetric keys), sets `req.user = { id, email, role }` where role comes from `app_metadata.role`, defaulting `'customer'`. `requireRole(...roles: Array<'staff' | 'super_admin'>)` guard. Phase 2 mounts these on protected routes; nothing mounts them in Phase 1.

- [ ] **Step 1: Write failing tests**

```ts
// api/src/middleware/__tests__/auth.test.ts
import { NextFunction, Request, Response } from 'express';
import { SignJWT } from 'jose';
import { env } from '../../config/env';
import { AppError } from '../../lib/AppError';
import { authenticate, requireRole } from '../auth';

const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);

async function makeToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('user-123')
    .setExpirationTime('1h')
    .sign(secret);
}

function mockReqRes(authHeader?: string) {
  const req = { headers: { authorization: authHeader } } as Request;
  const res = {} as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('authenticate', () => {
  it('attaches user with default customer role for a valid token', async () => {
    const token = await makeToken({ email: 'a@b.lk' });
    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ id: 'user-123', email: 'a@b.lk', role: 'customer' });
  });

  it('reads role from app_metadata', async () => {
    const token = await makeToken({ email: 'a@b.lk', app_metadata: { role: 'super_admin' } });
    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await authenticate(req, res, next);
    expect(req.user?.role).toBe('super_admin');
  });

  it('rejects missing header with 401', async () => {
    const { req, res, next } = mockReqRes(undefined);
    await authenticate(req, res, next);
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
  });

  it('rejects a tampered token with 401', async () => {
    const { req, res, next } = mockReqRes('Bearer not-a-real-token');
    await authenticate(req, res, next);
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
  });
});

describe('requireRole', () => {
  it('allows listed roles and rejects others with 403', () => {
    const guard = requireRole('staff', 'super_admin');
    const pass = mockReqRes();
    pass.req.user = { id: 'u', email: 'a@b.lk', role: 'staff' };
    guard(pass.req, pass.res, pass.next);
    expect(pass.next).toHaveBeenCalledWith();

    const fail = mockReqRes();
    fail.req.user = { id: 'u', email: 'a@b.lk', role: 'customer' };
    guard(fail.req, fail.res, fail.next);
    const err = (fail.next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(403);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd api && npx jest middleware/__tests__/auth`
Expected: FAIL — cannot find module '../auth'.

- [ ] **Step 3: Implement request typing + middleware**

```ts
// api/src/types/express.d.ts
export interface AuthUser {
  id: string;
  email: string | null;
  role: 'customer' | 'staff' | 'super_admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
```

In `api/tsconfig.json` change `"include": ["src"]` — already covers it (d.ts lives in src/types). No change needed if so; verify `npx tsc --noEmit` sees it.

```ts
// api/src/middleware/auth.ts
import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../config/env';
import { AppError } from '../lib/AppError';
import type { AuthUser } from '../types/express';

const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
const ROLES: ReadonlyArray<AuthUser['role']> = ['customer', 'staff', 'super_admin'];

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }
  try {
    const { payload } = await jwtVerify(header.slice(7), secret);
    const meta = (payload.app_metadata ?? {}) as { role?: string };
    const role = ROLES.includes(meta.role as AuthUser['role']) ? (meta.role as AuthUser['role']) : 'customer';
    req.user = {
      id: payload.sub ?? '',
      email: typeof payload.email === 'string' ? payload.email : null,
      role,
    };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export function requireRole(...roles: Array<'staff' | 'super_admin'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as 'staff' | 'super_admin')) {
      next(new AppError('Forbidden', 403));
      return;
    }
    next();
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && npx jest middleware/__tests__/auth`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add api/src
git commit -m "feat(api): Supabase JWT authentication and role guard middleware"
```

---

### Task 7: Seed script — storage upload + catalog data

**Files:**
- Create: `api/prisma/seed.ts`

**Interfaces:**
- Consumes: Prisma models (Task 3), `env` (Task 2), photos in `design/Photos-20260704T020151Z-3-001/Photos/`.
- Produces: public Storage bucket `product-images`; 4 categories; 8 products with images. Slugs the web app may link to later: categories `painting-kits`, `stem-kits`, `gift-collections`, `learning-toys`.

**Seed data table (exact values):**

| # | Product | slug | sku | price | compareAtPrice | ages | bestseller | category | photo file |
|---|---------|------|-----|-------|----------------|------|------------|----------|------------|
| 1 | DIY 3D Character Painting Kit — 3 Characters | character-painting-kit-3 | KP-PK-003 | 2500 | 12690 | 3–10 | yes | painting-kits | `3 char kit.jpeg` |
| 2 | DIY 3D Character Painting Kit — 5 Characters | character-painting-kit-5 | KP-PK-005 | 3500 | 15900 | 3–10 | yes | painting-kits | `5 char pack.jpeg` |
| 3 | DIY 3D Character Painting Kit — 10 Characters | character-painting-kit-10 | KP-PK-010 | 5900 | 24500 | 3–10 | yes | painting-kits | `10 char kit.jpeg` |
| 4 | Character Painting Party Pack | character-painting-party-pack | KP-PK-PTY | 4800 | 9600 | 4–12 | yes | painting-kits | `5 char packs.jpeg` |
| 5 | Sea Theme Painting Kit | sea-theme-painting-kit | KP-PK-SEA | 3890 | null | 3–8 | no | painting-kits | `Characters.jpg` |
| 6 | Return Gift Painting Set | return-gift-painting-set | KP-PK-RGS | 4200 | null | 3–10 | yes | painting-kits | `Return Gifts.jpeg` |
| 7 | KidPulse STEM Science Kit | stem-science-kit | KP-ST-SCI | 5100 | 8500 | 6–12 | yes | stem-kits | `Packs.jpeg` |
| 8 | Junior Engineer Building Kit | junior-engineer-building-kit | KP-ST-ENG | 6250 | null | 5–10 | no | stem-kits | `Packs.jpeg` |

(Photos for #7/#8 are placeholders until the client provides STEM shots — noted in seed comments.)

Categories: Painting Kits (`painting-kits`, sortOrder 1), STEM Kits (`stem-kits`, 2), Gift Collections (`gift-collections`, 3, no products → "Coming Soon"), Learning Toys (`learning-toys`, 4, no products → "Coming Soon").

- [ ] **Step 1: Write seed script**

```ts
// api/prisma/seed.ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env';
import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = 'product-images';
const PHOTOS_DIR = path.resolve(__dirname, '../../design/Photos-20260704T020151Z-3-001/Photos');

const CATEGORIES = [
  { name: 'Painting Kits', slug: 'painting-kits', description: 'DIY & Creative painting kits', sortOrder: 1 },
  { name: 'STEM Kits', slug: 'stem-kits', description: 'Science & Learning kits', sortOrder: 2 },
  { name: 'Gift Collections', slug: 'gift-collections', description: 'Birthday & Special gifts', sortOrder: 3 },
  { name: 'Learning Toys', slug: 'learning-toys', description: 'Educational toys for ages 3-10', sortOrder: 4 },
];

interface SeedProduct {
  name: string; slug: string; sku: string; description: string;
  price: number; compareAtPrice: number | null;
  ageRangeMin: number; ageRangeMax: number;
  isBestSeller: boolean; categorySlug: string; photo: string;
}

const PRODUCTS: SeedProduct[] = [
  { name: 'DIY 3D Character Painting Kit — 3 Characters', slug: 'character-painting-kit-3', sku: 'KP-PK-003', description: 'Paint-your-own 3D character kit with 3 characters, child-safe paints and brushes included.', price: 2500, compareAtPrice: 12690, ageRangeMin: 3, ageRangeMax: 10, isBestSeller: true, categorySlug: 'painting-kits', photo: '3 char kit.jpeg' },
  { name: 'DIY 3D Character Painting Kit — 5 Characters', slug: 'character-painting-kit-5', sku: 'KP-PK-005', description: 'Five favourite characters to paint, display and play with. Everything included in the box.', price: 3500, compareAtPrice: 15900, ageRangeMin: 3, ageRangeMax: 10, isBestSeller: true, categorySlug: 'painting-kits', photo: '5 char pack.jpeg' },
  { name: 'DIY 3D Character Painting Kit — 10 Characters', slug: 'character-painting-kit-10', sku: 'KP-PK-010', description: 'The big box: ten characters for parties, siblings or serious little artists.', price: 5900, compareAtPrice: 24500, ageRangeMin: 3, ageRangeMax: 10, isBestSeller: true, categorySlug: 'painting-kits', photo: '10 char kit.jpeg' },
  { name: 'Character Painting Party Pack', slug: 'character-painting-party-pack', sku: 'KP-PK-PTY', description: 'Party-ready multi-pack — keep a whole birthday table busy and proud of what they made.', price: 4800, compareAtPrice: 9600, ageRangeMin: 4, ageRangeMax: 12, isBestSeller: true, categorySlug: 'painting-kits', photo: '5 char packs.jpeg' },
  { name: 'Sea Theme Painting Kit', slug: 'sea-theme-painting-kit', sku: 'KP-PK-SEA', description: 'Under-the-sea characters to paint — a calm, creative afternoon in a box.', price: 3890, compareAtPrice: null, ageRangeMin: 3, ageRangeMax: 8, isBestSeller: false, categorySlug: 'painting-kits', photo: 'Characters.jpg' },
  { name: 'Return Gift Painting Set', slug: 'return-gift-painting-set', sku: 'KP-PK-RGS', description: 'Individually packed mini painting sets — the return gift other parents ask about.', price: 4200, compareAtPrice: null, ageRangeMin: 3, ageRangeMax: 10, isBestSeller: true, categorySlug: 'painting-kits', photo: 'Return Gifts.jpeg' },
  // NOTE: photos for the two STEM products are placeholders until client provides real shots.
  { name: 'KidPulse STEM Science Kit', slug: 'stem-science-kit', sku: 'KP-ST-SCI', description: 'Hands-on experiments that make science the best part of the day.', price: 5100, compareAtPrice: 8500, ageRangeMin: 6, ageRangeMax: 12, isBestSeller: true, categorySlug: 'stem-kits', photo: 'Packs.jpeg' },
  { name: 'Junior Engineer Building Kit', slug: 'junior-engineer-building-kit', sku: 'KP-ST-ENG', description: 'Build, test, rebuild — an open-ended construction kit for young engineers.', price: 6250, compareAtPrice: null, ageRangeMin: 5, ageRangeMax: 10, isBestSeller: false, categorySlug: 'stem-kits', photo: 'Packs.jpeg' },
];

async function ensureBucket(): Promise<void> {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !error.message.toLowerCase().includes('already exists')) throw error;
}

async function uploadPhoto(fileName: string, slug: string): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();
  const key = `${slug}${ext}`;
  const body = readFileSync(path.join(PHOTOS_DIR, fileName));
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
  const { error } = await supabase.storage.from(BUCKET).upload(key, body, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

async function main(): Promise<void> {
  await ensureBucket();

  const categoryIds = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
    categoryIds.set(c.slug, row.id);
  }

  for (const p of PRODUCTS) {
    const url = await uploadPhoto(p.photo, p.slug);
    const categoryId = categoryIds.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category ${p.categorySlug}`);
    const { photo, categorySlug, ...fields } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...fields, categoryId, stockQuantity: 50 },
      create: { ...fields, categoryId, stockQuantity: 50 },
    });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: { productId: product.id, url, altText: p.name, sortOrder: 0 },
    });
    logger.info({ slug: p.slug }, 'Seeded product');
  }
  logger.info('Seed complete');
}

main()
  .catch((error) => {
    logger.error({ error }, 'Seed failed');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run seed against dev DB**

Run: `cd api && npm run seed`
Expected: 8 "Seeded product" log lines + "Seed complete". Re-run once to confirm idempotency (no unique-constraint errors).

- [ ] **Step 3: Verify via API**

With `npm run dev` running:

```bash
curl -s http://localhost:4000/api/v1/categories | head -c 400
curl -s 'http://localhost:4000/api/v1/products?bestseller=true&limit=8' | head -c 400
```

Expected: categories JSON shows `painting-kits` productCount 6, `stem-kits` 2, others 0; products JSON returns 6 bestsellers with `images[0].url` pointing at `http://127.0.0.1:54321/storage/v1/object/public/product-images/...`. Open one image URL in a browser — it renders.

- [ ] **Step 4: Commit**

```bash
git add api/prisma/seed.ts
git commit -m "feat(api): idempotent seed with storage-hosted product photos"
```

---

### Task 8: Web scaffold — Next.js, theme tokens, fonts, assets, API client, Vitest

**Files:**
- Create: `web/` via create-next-app, then `web/.env.example`, `web/src/styles/` (keep default `globals.css` location `src/app/globals.css` — edit it), `web/src/lib/utils.ts`, `web/src/lib/api.ts`, `web/src/types/catalog.ts`, `web/vitest.config.ts`, `web/vitest.setup.ts`, `web/next.config.ts` (edit), `web/src/app/layout.tsx` (edit), assets under `web/public/images/`
- Test: `web/src/lib/__tests__/utils.test.ts`

**Interfaces:**
- Produces (consumed by all web tasks): `cn(...classes)`, `formatPrice(n): string` (`Rs. 2,500`), `discountPercent(price, compareAt): number`; types `Category`, `Product`, `ProductImage` (mirror API DTOs); `getCategories(): Promise<Category[]>` and `getBestSellers(): Promise<Product[]>` from `lib/api.ts` (ISR 60s, throw `ApiUnavailableError` on failure); Tailwind tokens `brand-indigo|indigo-deep|sky|sky-deep|gold|gold-deep|berry|berry-deep|cream|paper|ink|ink-soft|line|olive` (classes like `bg-brand-indigo`); font CSS vars wired so `font-display`/`font-sans` utilities work; asset paths `/images/logo.png`, `/images/hero-graphic.png`, `/images/moments/1.jpg`…`6.jpg`.

- [ ] **Step 1: Scaffold Next.js app**

```bash
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
cd web && npm install zustand sonner clsx tailwind-merge
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: app boots with `npm run dev` on port 3000.

- [ ] **Step 2: Copy brand assets**

```bash
mkdir -p web/public/images/moments
cp "design/Branding Materials-20260704T020142Z-3-001/Branding Materials/Kidpulse Logo Original_Horizontal.png" web/public/images/logo.png
cp "design/Branding Materials-20260704T020142Z-3-001/Branding Materials/kidpulse graphic.png" web/public/images/hero-graphic.png
cp "design/Branding Materials-20260704T020142Z-3-001/Branding Materials/site icon.png" web/src/app/icon.png
cp "design/Photos-20260704T020151Z-3-001/Photos/Characters.jpg" web/public/images/moments/1.jpg
cp "design/Photos-20260704T020151Z-3-001/Photos/3 char kit.jpeg" web/public/images/moments/2.jpg
cp "design/Photos-20260704T020151Z-3-001/Photos/5 char pack.jpeg" web/public/images/moments/3.jpg
cp "design/Photos-20260704T020151Z-3-001/Photos/Return Gifts.jpeg" web/public/images/moments/4.jpg
cp "design/Photos-20260704T020151Z-3-001/Photos/Packs.jpeg" web/public/images/moments/5.jpg
cp "design/Photos-20260704T020151Z-3-001/Photos/10 char kit.jpeg" web/public/images/moments/6.jpg
```

- [ ] **Step 3: Theme tokens + fonts**

Replace `web/src/app/globals.css` content (Tailwind v4 CSS-first config; if create-next-app produced a `tailwind.config.ts` v3 setup instead, put the same colors under `theme.extend.colors.brand` and fonts under `fontFamily` there):

```css
@import "tailwindcss";

@theme {
  --color-brand-indigo: #1b0b80;
  --color-brand-indigo-deep: #130860;
  --color-brand-sky: #38b6ff;
  --color-brand-sky-deep: #1d9eed;
  --color-brand-gold: #ffc300;
  --color-brand-gold-deep: #e8af00;
  --color-brand-berry: #ed3f7f;
  --color-brand-berry-deep: #d12d68;
  --color-brand-cream: #fff4e0;
  --color-brand-paper: #fffdf8;
  --color-brand-ink: #1c1530;
  --color-brand-ink-soft: #5d5775;
  --color-brand-line: #ece7f5;
  --color-brand-olive: #8fb821;
}

@theme inline {
  --font-sans: var(--font-fredoka), sans-serif;
  --font-display: var(--font-baloo), cursive;
}

body {
  background-color: var(--color-brand-paper);
  color: var(--color-brand-ink);
}
```

Edit `web/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Baloo_2, Fredoka } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const baloo = Baloo_2({ subsets: ['latin'], variable: '--font-baloo', display: 'swap' });
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'KidPulse — Craft Kits for Kids', template: '%s | KidPulse' },
  description:
    'DIY character painting kits and STEM kits that turn screen time into hands-on play. Island-wide delivery in Sri Lanka.',
  openGraph: {
    title: 'KidPulse — Craft Kits for Kids',
    description: 'Craft kits that turn screen time into hands-on play.',
    images: ['/images/hero-graphic.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo.variable} ${fredoka.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
```

(Root layout keeps its default export — Next.js requires it; the named-export rule applies to our own components.)

- [ ] **Step 4: next/image remote patterns + env**

`web/next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '54321', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

export default nextConfig;
```

`web/.env.example` (copy to `web/.env`):

```bash
API_URL=http://localhost:4000
SITE_URL=http://localhost:3000
```

- [ ] **Step 5: Types, utils, API client**

```ts
// web/src/types/catalog.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stockQuantity: number;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  category: { id: string; name: string; slug: string };
  images: ProductImage[];
}
```

```ts
// web/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-US')}`;
}

export function discountPercent(price: number, compareAtPrice: number): number {
  return Math.round((1 - price / compareAtPrice) * 100);
}
```

```ts
// web/src/lib/api.ts
import type { Category, Product } from '@/types/catalog';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export class ApiUnavailableError extends Error {}

async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  } catch {
    throw new ApiUnavailableError(`API unreachable: ${path}`);
  }
  if (!res.ok) throw new ApiUnavailableError(`API error ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/api/v1/categories');
}

export function getBestSellers(): Promise<Product[]> {
  return apiGet<Product[]>('/api/v1/products?bestseller=true&limit=8');
}
```

- [ ] **Step 6: Vitest setup + first test**

```ts
// web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

```ts
// web/vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

Add to `web/package.json` scripts: `"test": "vitest run"`.

```ts
// web/src/lib/__tests__/utils.test.ts
import { describe, expect, it } from 'vitest';
import { discountPercent, formatPrice } from '../utils';

describe('formatPrice', () => {
  it('formats LKR with thousands separators', () => {
    expect(formatPrice(2500)).toBe('Rs. 2,500');
    expect(formatPrice(12690)).toBe('Rs. 12,690');
  });
});

describe('discountPercent', () => {
  it('rounds to whole percent', () => {
    expect(discountPercent(2500, 12690)).toBe(80);
    expect(discountPercent(5100, 8500)).toBe(40);
  });
});
```

Run: `cd web && npm test`
Expected: PASS. (Note 2500/12690 is -80%; the template's "-82%" badge is computed per-product, so our badge will show the true value.)

- [ ] **Step 7: Verify dev boot and commit**

Run: `cd web && npm run dev` — page renders default content with no console errors, then Ctrl-C.

```bash
git add web/
git commit -m "feat(web): scaffold Next.js app with brand theme, fonts, assets, API client"
```

---

### Task 9: UI primitives (TDD)

**Files:**
- Create: `web/src/components/ui/Button.tsx`, `Badge.tsx`, `PriceTag.tsx`, `Skeleton.tsx`, `SectionHeading.tsx`, `Input.tsx`
- Test: `web/src/components/ui/__tests__/primitives.test.tsx`

**Interfaces:**
- Consumes: `cn`, `formatPrice`, `discountPercent` (Task 8).
- Produces: `Button({ variant?: 'primary'|'secondary'|'ghost', size?: 'md'|'lg', ...buttonProps })`, `Badge({ tone?: 'berry'|'gold'|'sky'|'neutral', children })`, `PriceTag({ price, compareAtPrice? })` (renders formatted price, strike-through compare price and `-NN%` badge when compareAtPrice present), `Skeleton({ className? })`, `SectionHeading({ title, action? })`, `Input(props)` — used by every feature component in Tasks 10–13.

- [ ] **Step 1: Write failing tests**

```tsx
// web/src/components/ui/__tests__/primitives.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { PriceTag } from '../PriceTag';
import { SectionHeading } from '../SectionHeading';

describe('PriceTag', () => {
  it('shows price, compare price and discount badge when discounted', () => {
    render(<PriceTag price={2500} compareAtPrice={12690} />);
    expect(screen.getByText('Rs. 2,500')).toBeInTheDocument();
    expect(screen.getByText('Rs. 12,690')).toBeInTheDocument();
    expect(screen.getByText('-80%')).toBeInTheDocument();
  });

  it('shows only price when not discounted', () => {
    render(<PriceTag price={3890} compareAtPrice={null} />);
    expect(screen.getByText('Rs. 3,890')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders children and respects disabled', () => {
    render(<Button disabled>Add to Cart</Button>);
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });
});

describe('Badge', () => {
  it('renders content', () => {
    render(<Badge tone="gold">Ages 3-10</Badge>);
    expect(screen.getByText('Ages 3-10')).toBeInTheDocument();
  });
});

describe('SectionHeading', () => {
  it('renders title as h2', () => {
    render(<SectionHeading title="Best Selling Products" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Best Selling Products' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npm test`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement primitives**

```tsx
// web/src/components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
}

const variants = {
  primary: 'bg-brand-berry text-white hover:bg-brand-berry-deep',
  secondary: 'bg-brand-indigo text-white hover:bg-brand-indigo-deep',
  ghost: 'bg-transparent text-brand-indigo hover:bg-brand-cream',
};

const sizes = { md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
```

```tsx
// web/src/components/ui/Badge.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  tone?: 'berry' | 'gold' | 'sky' | 'neutral';
  className?: string;
  children: ReactNode;
}

const tones = {
  berry: 'bg-brand-berry text-white',
  gold: 'bg-brand-gold text-brand-ink',
  sky: 'bg-brand-sky text-white',
  neutral: 'bg-brand-cream text-brand-ink-soft',
};

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
```

```tsx
// web/src/components/ui/PriceTag.tsx
import { discountPercent, formatPrice } from '@/lib/utils';
import { Badge } from './Badge';

interface PriceTagProps {
  price: number;
  compareAtPrice?: number | null;
}

export function PriceTag({ price, compareAtPrice }: PriceTagProps) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-display text-lg font-bold text-brand-indigo">{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-brand-ink-soft line-through">{formatPrice(compareAtPrice)}</span>
          <Badge tone="berry">-{discountPercent(price, compareAtPrice)}%</Badge>
        </>
      )}
    </div>
  );
}
```

```tsx
// web/src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-brand-line', className)} />;
}
```

```tsx
// web/src/components/ui/SectionHeading.tsx
import { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold text-brand-indigo md:text-3xl">{title}</h2>
      {action}
    </div>
  );
}
```

```tsx
// web/src/components/ui/Input.tsx
import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-full border border-brand-line bg-white px-4 py-2.5 text-sm text-brand-ink placeholder:text-brand-ink-soft focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/30',
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npm test`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add web/src/components
git commit -m "feat(web): brand UI primitives"
```

---

### Task 10: Cart store + AddToCart / CartButton (TDD)

**Files:**
- Create: `web/src/stores/cartStore.ts`, `web/src/components/features/cart/AddToCartButton.tsx`, `web/src/components/features/cart/CartButton.tsx`
- Test: `web/src/stores/__tests__/cartStore.test.ts`

**Interfaces:**
- Consumes: `Button` (Task 9), `Product` type (Task 8).
- Produces: `useCartStore` — state `{ items: CartItem[] }` with `CartItem = { productId, name, price, imageUrl: string | null, quantity }`; actions `addItem(item: Omit<CartItem,'quantity'>)` (merges by productId), `removeItem(productId)`, `updateQuantity(productId, quantity)` (≤0 removes), `clear()`; selector helper `selectItemCount(state): number`. Persisted to localStorage key `kidpulse-cart`. `AddToCartButton({ product })` (client) adds + shows sonner toast. `CartButton` (client) renders cart icon with count badge, hydration-safe. Checkout phases reuse this exact store.

- [ ] **Step 1: Write failing store tests**

```ts
// web/src/stores/__tests__/cartStore.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { selectItemCount, useCartStore } from '../cartStore';

const kit = { productId: 'p1', name: '3 Char Kit', price: 2500, imageUrl: null };

beforeEach(() => {
  useCartStore.setState({ items: [] });
  localStorage.clear();
});

describe('cartStore', () => {
  it('adds items and merges duplicates by productId', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().addItem(kit);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('updates quantity and removes at zero', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().updateQuantity('p1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    useCartStore.getState().updateQuantity('p1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('counts total quantity across items', () => {
    useCartStore.getState().addItem(kit);
    useCartStore.getState().addItem({ ...kit, productId: 'p2' });
    useCartStore.getState().updateQuantity('p1', 3);
    expect(selectItemCount(useCartStore.getState())).toBe(4);
  });

  it('persists to localStorage', () => {
    useCartStore.getState().addItem(kit);
    expect(localStorage.getItem('kidpulse-cart')).toContain('p1');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npm test`
Expected: FAIL — cannot find `../cartStore`.

- [ ] **Step 3: Implement store**

```ts
// web/src/stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number; // display-only snapshot; checkout re-validates server-side
  imageUrl: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'kidpulse-cart' }
  )
);

export function selectItemCount(state: { items: CartItem[] }): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npm test`
Expected: PASS.

- [ ] **Step 5: Implement the two client components**

```tsx
// web/src/components/features/cart/AddToCartButton.tsx
'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types/catalog';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url ?? null,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Button className="w-full" onClick={handleAdd} disabled={product.stockQuantity === 0}>
      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  );
}
```

```tsx
// web/src/components/features/cart/CartButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { selectItemCount, useCartStore } from '@/stores/cartStore';

export function CartButton() {
  const count = useCartStore(selectItemCount);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label="Shopping cart"
      className="relative flex items-center gap-2 rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-gold-deep"
    >
      <span aria-hidden>🛒</span>
      <span className="hidden sm:inline">Cart</span>
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-berry px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
```

(`mounted` gate avoids a hydration mismatch from localStorage-persisted state.)

- [ ] **Step 6: Typecheck + full web tests, commit**

Run: `cd web && npx tsc --noEmit && npm test`
Expected: clean + PASS.

```bash
git add web/src
git commit -m "feat(web): persistent cart store with add-to-cart and header cart button"
```

---

### Task 11: Announcement bar, header (mobile menu), hero, sale banner

**Files:**
- Create: `web/src/components/features/layout/AnnouncementBar.tsx`, `web/src/components/features/layout/SiteHeader.tsx`, `web/src/components/features/layout/MobileMenu.tsx`, `web/src/components/features/home/Hero.tsx`, `web/src/components/features/home/SaleBanner.tsx`, `web/src/config/nav.ts`

**Interfaces:**
- Consumes: `CartButton` (Task 10), `Button`, `Input` (Task 9), `/images/logo.png`, `/images/hero-graphic.png`.
- Produces: `NAV_LINKS: Array<{ label: string; href: string }>` in `config/nav.ts`; server components `AnnouncementBar`, `SiteHeader`, `Hero`, `SaleBanner`; client `MobileMenu`. Task 14 composes them. Nav links point to future routes (`/products`, `/products?category=...`, `/about`, `/contact`) — dead links are acceptable this phase.

- [ ] **Step 1: Nav config**

```ts
// web/src/config/nav.ts
export const NAV_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'Painting Kits', href: '/products?category=painting-kits' },
  { label: 'STEM Kits', href: '/products?category=stem-kits' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;
```

- [ ] **Step 2: AnnouncementBar + SiteHeader + MobileMenu**

```tsx
// web/src/components/features/layout/AnnouncementBar.tsx
import Link from 'next/link';

export function AnnouncementBar() {
  return (
    <div className="bg-brand-indigo px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-6">
        <span>🚚 Free delivery on orders over Rs. 5,000</span>
        <span className="hidden items-center gap-4 sm:flex">
          <Link href="/track-order" className="hover:text-brand-gold">Track Order</Link>
          <Link href="/help" className="hover:text-brand-gold">Help Center</Link>
        </span>
      </div>
    </div>
  );
}
```

```tsx
// web/src/components/features/layout/SiteHeader.tsx
import Image from 'next/image';
import Link from 'next/link';
import { CartButton } from '@/components/features/cart/CartButton';
import { Input } from '@/components/ui/Input';
import { NAV_LINKS } from '@/config/nav';
import { MobileMenu } from './MobileMenu';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-line bg-brand-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <MobileMenu />
        <Link href="/" aria-label="KidPulse home" className="shrink-0">
          <Image src="/images/logo.png" alt="KidPulse" width={140} height={40} priority />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-brand-ink hover:text-brand-berry">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden max-w-xs flex-1 md:block">
          <Input type="search" placeholder="Search kits, toys, gifts…" aria-label="Search products" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" aria-label="Wishlist" className="rounded-full p-2 text-xl hover:bg-brand-cream">♡</button>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
```

```tsx
// web/src/components/features/layout/MobileMenu.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NAV_LINKS } from '@/config/nav';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-full p-2 text-xl hover:bg-brand-cream"
      >
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-brand-line bg-brand-paper px-6 py-4 shadow-lg"
        >
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-1 text-base font-medium text-brand-ink hover:text-brand-berry"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Hero + SaleBanner**

```tsx
// web/src/components/features/home/Hero.tsx
import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-cream to-brand-paper">
      <div aria-hidden className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-brand-sky/20 blur-2xl" />
      <div aria-hidden className="absolute -right-8 bottom-8 h-40 w-40 rounded-full bg-brand-berry/15 blur-2xl" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-brand-indigo md:text-5xl">
            Craft kits that turn <span className="text-brand-berry">screen time</span> into hands-on play.
          </h1>
          <p className="mt-4 max-w-md text-brand-ink-soft">
            DIY character painting kits and STEM kits, delivered island-wide. Child-safe materials, endless proud moments.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-brand-berry px-8 py-3 font-display text-lg font-semibold text-white transition-colors hover:bg-brand-berry-deep"
            >
              🛍️ Shop Now
            </Link>
            <div className="text-sm text-brand-ink-soft">
              <p>🎨 New kit weekly</p>
              <p>⭐ 4.9 average rating</p>
            </div>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <Image
            src="/images/hero-graphic.png"
            alt="KidPulse craft kit characters"
            width={520}
            height={520}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
```

```tsx
// web/src/components/features/home/SaleBanner.tsx
import Link from 'next/link';

export function SaleBanner() {
  return (
    <section className="bg-brand-berry">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="font-display text-xl font-bold text-white md:text-2xl">
            Character Painting Kits — up to 80% off
          </h3>
          <p className="text-sm text-white/85">Limited stock. Island-wide delivery.</p>
        </div>
        <Link
          href="/products?category=painting-kits"
          className="rounded-full bg-brand-gold px-6 py-2.5 font-semibold text-brand-ink transition-colors hover:bg-brand-gold-deep"
        >
          Shop the sale →
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Typecheck, commit**

Run: `cd web && npx tsc --noEmit && npm test`
Expected: clean + tests still pass.

```bash
git add web/src
git commit -m "feat(web): announcement bar, header with mobile menu, hero, sale banner"
```

---

### Task 12: Data-driven sections — ProductCard, BestSellers, CategoryCards (TDD)

**Files:**
- Create: `web/src/components/features/home/ProductCard.tsx`, `web/src/components/features/home/BestSellers.tsx`, `web/src/components/features/home/CategoryCards.tsx`
- Test: `web/src/components/features/home/__tests__/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `getCategories`/`getBestSellers`/`ApiUnavailableError` (Task 8), `PriceTag`/`Badge`/`SectionHeading`/`Skeleton` (Task 9), `AddToCartButton` (Task 10), types (Task 8).
- Produces: presentational `ProductCard({ product })`; async server components `BestSellers()` and `CategoryCards()` that fetch their own data and render an empty/degraded state when the API is down (never throw to the page). Task 14 composes them.

- [ ] **Step 1: Write failing ProductCard test**

```tsx
// web/src/components/features/home/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/catalog';
import { ProductCard } from '../ProductCard';

const product: Product = {
  id: 'p1',
  name: 'DIY 3D Character Painting Kit — 3 Characters',
  slug: 'character-painting-kit-3',
  description: 'Paint-your-own kit',
  price: 2500,
  compareAtPrice: 12690,
  sku: 'KP-PK-003',
  stockQuantity: 50,
  ageRangeMin: 3,
  ageRangeMax: 10,
  isFeatured: false,
  isBestSeller: true,
  category: { id: 'c1', name: 'Painting Kits', slug: 'painting-kits' },
  images: [{ id: 'i1', url: 'http://127.0.0.1:54321/storage/v1/object/public/product-images/x.jpeg', altText: 'kit', sortOrder: 0 }],
};

describe('ProductCard', () => {
  it('renders name, category, age badge, prices and discount', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText('Painting Kits')).toBeInTheDocument();
    expect(screen.getByText('Ages 3–10')).toBeInTheDocument();
    expect(screen.getByText('Rs. 2,500')).toBeInTheDocument();
    expect(screen.getByText('Rs. 12,690')).toBeInTheDocument();
    expect(screen.getByText('-80%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeEnabled();
  });

  it('omits age badge when age range missing', () => {
    render(<ProductCard product={{ ...product, ageRangeMin: null, ageRangeMax: null }} />);
    expect(screen.queryByText(/Ages/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement ProductCard**

```tsx
// web/src/components/features/home/ProductCard.tsx
import Image from 'next/image';
import { AddToCartButton } from '@/components/features/cart/AddToCartButton';
import { Badge } from '@/components/ui/Badge';
import { PriceTag } from '@/components/ui/PriceTag';
import type { Product } from '@/types/catalog';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-square bg-brand-cream">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl" aria-hidden>🎨</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-brand-ink-soft">{product.category.name}</span>
          {product.ageRangeMin != null && product.ageRangeMax != null && (
            <Badge tone="sky">{`Ages ${product.ageRangeMin}–${product.ageRangeMax}`}</Badge>
          )}
        </div>
        <h3 className="line-clamp-2 font-semibold text-brand-ink">{product.name}</h3>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
        <div className="mt-auto pt-2">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npm test`
Expected: PASS.

- [ ] **Step 5: Implement server sections with graceful degradation**

```tsx
// web/src/components/features/home/BestSellers.tsx
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getBestSellers } from '@/lib/api';
import type { Product } from '@/types/catalog';
import { ProductCard } from './ProductCard';

export async function BestSellers() {
  let products: Product[] = [];
  try {
    products = await getBestSellers();
  } catch {
    return null; // API down — hide section rather than crash the page
  }
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading
        title="Best Selling Products"
        action={<Link href="/products" className="text-sm font-semibold text-brand-berry hover:text-brand-berry-deep">View all →</Link>}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
```

```tsx
// web/src/components/features/home/CategoryCards.tsx
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types/catalog';

const CATEGORY_EMOJI: Record<string, string> = {
  'painting-kits': '🎨',
  'stem-kits': '🧪',
  'gift-collections': '🎁',
  'learning-toys': '🧸',
};

export async function CategoryCards() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    return null;
  }
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((c) => {
          const comingSoon = c.productCount === 0;
          return (
            <Link
              key={c.id}
              href={comingSoon ? '#' : `/products?category=${c.slug}`}
              aria-disabled={comingSoon}
              className="group rounded-2xl border border-brand-line bg-white p-5 transition-shadow hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden>{CATEGORY_EMOJI[c.slug] ?? '⭐'}</span>
              <h3 className="mt-3 font-display font-bold text-brand-indigo">{c.name}</h3>
              <p className="mt-1 text-sm text-brand-ink-soft">
                {comingSoon ? 'Coming Soon' : `${c.productCount} products`}
                {!comingSoon && <span className="ml-1 text-brand-berry transition-transform group-hover:translate-x-0.5">→</span>}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Typecheck + tests, commit**

Run: `cd web && npx tsc --noEmit && npm test`
Expected: clean + PASS.

```bash
git add web/src
git commit -m "feat(web): product card, best sellers and category sections with live data"
```

---

### Task 13: Moments gallery, testimonials, newsletter, footer

**Files:**
- Create: `web/src/components/features/home/MomentsGallery.tsx`, `web/src/components/features/home/Testimonials.tsx`, `web/src/components/features/home/NewsletterSignup.tsx`, `web/src/components/features/layout/SiteFooter.tsx`

**Interfaces:**
- Consumes: `SectionHeading`, `Input`, `Button` (Task 9), `/images/moments/1.jpg`…`6.jpg` (Task 8).
- Produces: server components `MomentsGallery`, `Testimonials`, `SiteFooter`; client `NewsletterSignup` (toast only this phase). Task 14 composes them.

- [ ] **Step 1: MomentsGallery + Testimonials**

```tsx
// web/src/components/features/home/MomentsGallery.tsx
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';

const MOMENTS = [1, 2, 3, 4, 5, 6].map((n) => ({
  src: `/images/moments/${n}.jpg`,
  alt: `Kids enjoying KidPulse craft kits — photo ${n}`,
}));

export function MomentsGallery() {
  return (
    <section className="bg-brand-cream/50 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title="Shared Moments with KidPulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MOMENTS.map((m) => (
            <div key={m.src} className="relative aspect-square overflow-hidden rounded-2xl">
              <Image src={m.src} alt={m.alt} fill sizes="(max-width: 640px) 50vw, 17vw" className="object-cover transition-transform duration-300 hover:scale-105" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm font-semibold text-brand-ink-soft">5,000+ happy parents 💛</p>
      </div>
    </section>
  );
}
```

```tsx
// web/src/components/features/home/Testimonials.tsx
import { SectionHeading } from '@/components/ui/SectionHeading';

const TESTIMONIALS = [
  { quote: "My daughter spent hours painting instead of watching cartoons. The quality is amazing and she's so proud of what she made!", name: 'Nadeesha', city: 'Colombo' },
  { quote: 'The perfect birthday return gift. All the other parents asked where I got them — ordered another batch the next week!', name: 'Tharindu', city: 'Kandy' },
  { quote: 'Excellent quality and so easy to use. My 5-year-old finished it almost on his own. Genuinely educational and fun.', name: 'Dilushi', city: 'Galle' },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading title="What Parents Say" />
      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="rounded-2xl border border-brand-line bg-white p-6">
            <p aria-label="5 out of 5 stars" className="text-brand-gold">★★★★★</p>
            <blockquote className="mt-3 text-sm text-brand-ink">{t.quote}</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky font-bold text-white">
                {t.name[0]}
              </span>
              <span>
                <span className="block text-sm font-semibold text-brand-ink">{t.name}</span>
                <span className="block text-xs text-brand-ink-soft">{t.city}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: NewsletterSignup (client) + SiteFooter**

```tsx
// web/src/components/features/home/NewsletterSignup.tsx
'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Phase 1: acknowledge only — persistence arrives with the accounts phase.
    toast.success("You're on the list! Check your inbox for your 10% code soon.");
    setEmail('');
  };

  return (
    <section className="bg-brand-indigo py-14">
      <div className="mx-auto max-w-xl px-4 text-center">
        <h3 className="font-display text-2xl font-bold text-white md:text-3xl">Get 10% off your first order</h3>
        <p className="mt-2 text-sm text-white/80">
          Join our newsletter for new kit drops, parenting tips, and exclusive discounts.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
          />
          <Button type="submit" variant="primary" className="shrink-0">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}
```

```tsx
// web/src/components/features/layout/SiteFooter.tsx
import Image from 'next/image';
import Link from 'next/link';

const COLUMNS = [
  { heading: 'Shop', links: [['All Products', '/products'], ['New Arrivals', '/products?sort=new'], ['Best Sellers', '/products?bestseller=true'], ['Gift Sets', '/products?category=gift-collections']] },
  { heading: 'Company', links: [['About Us', '/about'], ['Blog', '/blog'], ['Contact', '/contact']] },
  { heading: 'Support', links: [['Track Order', '/track-order'], ['Returns', '/returns'], ['Shipping Info', '/shipping'], ['FAQs', '/faq']] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-line bg-brand-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/images/logo.png" alt="KidPulse" width={140} height={40} />
          <p className="mt-3 text-sm text-brand-ink-soft">
            Craft kits that turn screen time into hands-on play. Made with 💛 in Sri Lanka.
          </p>
          <p className="mt-4 text-xs font-semibold text-brand-ink-soft">
            We accept: PayHere · Cash on Delivery · Bank Transfer
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h4 className="font-display font-bold text-brand-indigo">{col.heading}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-brand-ink-soft hover:text-brand-berry">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-brand-line py-5 text-center text-xs text-brand-ink-soft">
        © {new Date().getFullYear()} KidPulse · Lunor Labs (Pvt) Ltd. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Typecheck + tests, commit**

Run: `cd web && npx tsc --noEmit && npm test`
Expected: clean + PASS.

```bash
git add web/src
git commit -m "feat(web): moments gallery, testimonials, newsletter and footer"
```

---

### Task 14: Home page assembly, loading/error states, SEO files, end-to-end verification

**Files:**
- Create: `web/src/app/loading.tsx`, `web/src/app/error.tsx`, `web/src/app/robots.ts`, `web/src/app/sitemap.ts`
- Modify: `web/src/app/page.tsx` (replace scaffold content)

**Interfaces:**
- Consumes: every component from Tasks 10–13.
- Produces: the finished landing page at `/`.

- [ ] **Step 1: Assemble page**

```tsx
// web/src/app/page.tsx
import { AnnouncementBar } from '@/components/features/layout/AnnouncementBar';
import { SiteFooter } from '@/components/features/layout/SiteFooter';
import { SiteHeader } from '@/components/features/layout/SiteHeader';
import { BestSellers } from '@/components/features/home/BestSellers';
import { CategoryCards } from '@/components/features/home/CategoryCards';
import { Hero } from '@/components/features/home/Hero';
import { MomentsGallery } from '@/components/features/home/MomentsGallery';
import { NewsletterSignup } from '@/components/features/home/NewsletterSignup';
import { SaleBanner } from '@/components/features/home/SaleBanner';
import { Testimonials } from '@/components/features/home/Testimonials';

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <CategoryCards />
        <SaleBanner />
        <BestSellers />
        <MomentsGallery />
        <Testimonials />
        <NewsletterSignup />
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 2: Loading and error states**

```tsx
// web/src/app/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <Skeleton className="h-72 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// web/src/app/error.tsx
'use client';

import { Button } from '@/components/ui/Button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl" aria-hidden>🎨</p>
      <h1 className="font-display text-2xl font-bold text-brand-indigo">Something went wrong</h1>
      <p className="text-brand-ink-soft">Please try again in a moment.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
```

- [ ] **Step 3: robots + sitemap**

```ts
// web/src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

```ts
// web/src/app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  return [{ url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
}
```

- [ ] **Step 4: Full end-to-end verification**

With `supabase start` running, DB migrated and seeded:

```bash
(cd api && npm run dev &) && (cd web && npm run dev &)
sleep 8
curl -s http://localhost:4000/health
curl -s http://localhost:4000/api/v1/categories | python3 -m json.tool | head -20
curl -s http://localhost:3000 -o /dev/null -w '%{http_code}\n'
```

Then verify in a browser at `http://localhost:3000`:
1. Hero, logo, fonts render (Baloo 2 headings, Fredoka body).
2. Category cards show "6 products" / "2 products" / two "Coming Soon".
3. Best Sellers shows 6 product cards with real photos from Supabase Storage, prices like `Rs. 2,500`, strike-through `Rs. 12,690`, `-80%` badges.
4. Add to Cart → toast appears, header badge increments; reload page → badge count survives (localStorage).
5. Newsletter submit → success toast.
6. Narrow window to <768px: mobile menu ☰ opens/closes, layout stacks cleanly, no horizontal scroll.
7. Stop the API (`kill` the api dev process), hard-refresh with cache cleared (`rm -rf web/.next` then restart web): page still renders hero/moments/testimonials/footer without crashing (data sections hidden).

- [ ] **Step 5: Full test suites + production build**

```bash
(cd api && npm test) && (cd web && npm test && npm run build)
```

Expected: all tests pass; `next build` completes with `/` prerendered (ISR).

- [ ] **Step 6: Commit**

```bash
git add web/src
git commit -m "feat(web): assemble landing page with loading, error, robots and sitemap"
```

---

## Post-plan notes for the executor

- **MSW:** the spec mentions MSW for API mocking; Phase 1 has no client-side data fetching (all fetches are in Server Components), so MSW is intentionally not installed yet. Add it in the phase that introduces client-side fetching.
- **Supabase JWT:** local stack signs HS256 with the printed JWT secret. When the cloud project is created, if it uses asymmetric signing keys, switch `authenticate` to `createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`))` — the middleware's contract (`req.user`) does not change.
- **Discount copy:** the template says "-82%"; real seeded numbers compute -80%. Design copy was adjusted to "up to 80% off" to stay truthful. If the client wants the 82% figure, adjust seed prices (e.g. price 2290 vs 12690 ≈ 82%).
