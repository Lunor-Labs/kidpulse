# KidPulse — Phase 1: Foundation + Landing Page — Design Spec

**Date:** 2026-07-04
**Status:** Approved by user (conversation, 2026-07-04)
**Client:** Lunor Labs (Pvt) Ltd — KidPulse e-commerce (kids' craft kits, Sri Lanka)

## Context

KidPulse is a full e-commerce site (see `design/KidPulse_Requirement_Gathering.docx.pdf`):
storefront with catalog/search/reviews, customer accounts (email + Google via Supabase
Auth), cart with guest checkout and coupons, PayHere + Cash on Delivery payments, and an
admin panel (orders, products/inventory, promotions, customers, analytics). Phase 1
builds the project foundation and a fully working landing page with live data. Every
later phase builds additively on this foundation.

The visual reference is `design/kidpulse_homepage_v4.html` plus branding materials
(logo, product photos, brand palette). The client approved enhancing the template.

## Architecture (project-wide decision)

Separate frontend and backend deployments. Chosen over a single Next.js full-stack app
because payment security (PayHere merchant secrets, hash generation, server-to-server
`notify_url` webhook) and order integrity (server-computed prices, coupon and stock
validation) warrant a hard API boundary the team fully controls.

| Piece | Technology | Role |
|---|---|---|
| Frontend | Next.js 14+ App Router, TypeScript strict, Tailwind CSS | Storefront + (later) admin UI at `/admin`. Server Components fetch from the API |
| Backend | Express + TypeScript + Prisma; routes → controllers → services → repositories | All business logic. Only the API talks to the database |
| Auth | Supabase Auth | Email/password + Google. Frontend obtains JWT; Express verifies it and enforces roles (customer / staff / super admin) |
| Database | Supabase Postgres via Prisma | Single source of truth |
| Storage | Supabase Storage | Product images, uploaded via API (admin), served via CDN URLs |

- Local development uses the **Supabase CLI** (Docker): local Postgres, Auth, and
  Storage mirroring production. Cloud Supabase project connected later for
  staging/production.
- Deployment shape: web on Vercel (or similar), API on Railway/Render/Fly/VPS.
  HTTPS everywhere; CORS locked to the web origin.
- The frontend never sends prices — only product IDs and quantities. All money math,
  coupon validation, and stock checks happen in the API (enforced from Phase 1's
  layering even though checkout arrives later).
- Both apps follow the repo's `.claude/skills/frontend-standards` and
  `.claude/skills/backend-standards` skills exactly (folder structure, layering,
  logging, error handling, testing stacks).

## Repository layout

```
kidpulse/
  web/          # Next.js storefront (frontend-standards src/ structure)
  api/          # Express API (backend-standards src/ + prisma/ structure)
  supabase/     # Supabase CLI config for local dev stack
  design/       # existing reference materials (untouched)
  docs/         # specs and plans
```

Each app has its own `package.json` and `.env.example` (real `.env` files are never
committed). No monorepo tooling.

## Database schema (Phase 1)

Prisma migrations (`prisma migrate dev`) against local Supabase Postgres. cuid IDs,
`createdAt`/`updatedAt` on every model, `@@map` to snake_case table names.

**categories**
- id, name, slug (unique), description (nullable), imageUrl (nullable),
  sortOrder (int, default 0), isActive (default true)

**products**
- id, name, slug (unique), description, price Decimal(10,2),
  compareAtPrice Decimal(10,2) nullable (powers sale badges/strike-through),
  sku (unique), stockQuantity (int, default 0), ageRangeMin/ageRangeMax (int, nullable),
  isFeatured (default false), isBestSeller (default false), isActive (default true),
  categoryId FK → categories

**product_images**
- id, productId FK (cascade delete), url, altText, sortOrder (int, default 0)

Later phases add variants, reviews, orders, order_items, addresses, coupons, wishlist,
and profile tables referencing these — no rework of Phase 1 tables is expected.

**Seed script** (`prisma/seed.ts`):
- 4 categories from the design: Painting Kits, STEM Kits, Gift Collections,
  Learning Toys (last two seeded with no products → "Coming Soon" cards).
- ~8 real products (3/5/10-character painting kits, 5-character packs, return gifts)
  with LKR pricing and compareAtPrice values taken from the design template's
  product cards (placeholders until the client confirms real prices), matching the
  sale story ("up to 82% off"), flagged isBestSeller as appropriate.
- Uploads photos from `design/Photos-…/Photos/` to a public `product-images`
  Supabase Storage bucket and stores resulting URLs in `product_images`.
- Idempotent: safe to re-run (upsert by slug/sku).

## API surface (Phase 1)

Versioned under `/api/v1`. Response envelope: success `{ data }`, failure `{ error }`
(safe message only; details logged server-side via Pino).

- `GET /api/v1/categories` — active categories ordered by sortOrder, each with a
  product count (count of active products).
- `GET /api/v1/products` — active products; Zod-validated query params:
  `bestseller` (boolean), `featured` (boolean), `categoryId`, `limit` (default 12,
  max 50). Returns products with images and category. Later phases extend this same
  endpoint with price/age filters, search, and pagination.
- `GET /health` — status + timestamp.

Middleware stack (order matters): helmet → CORS (origins from `ALLOWED_ORIGINS`) →
`express.json({ limit: '10kb' })` → rate limit (100 req / 15 min) → routes → central
`errorHandler`. Auth middleware (`authenticate`: Supabase JWT verification via JWKS,
attaches user + role to request) is implemented and unit-tested in Phase 1 but not
mounted on any route yet — Phase 2 (accounts) exercises it.

## Frontend (Phase 1)

### Landing page sections (top to bottom)

All data-driven sections are Server Components fetching from the API with ISR
(`next: { revalidate: 60 }`).

1. **Announcement bar** — free-delivery/promo line, Track Order + Help links.
2. **Header** — logo, nav (All Products, Categories, About, Contact — links point to
   future routes), search input (UI only; wired in catalog phase), wishlist icon
   (UI only), cart button with live item-count badge. Mobile: slide-out menu.
3. **Hero** — headline ("Craft kits that turn screen time into hands-on play"),
   subcopy, Shop Now CTA, brand graphic from branding materials, playful floating
   shapes/blobs in brand colors.
4. **Category cards** — 4 cards with live product counts from the API; categories
   with zero products render a "Coming Soon" state.
5. **Sale banner** — berry/gold strip: "Character Painting Kits — up to 82% off".
6. **Best Sellers grid** — up to 8 products via `GET /products?bestseller=true`;
   `ProductCard` shows image (next/image), name, age-range badge, price with
   strike-through compareAtPrice + discount badge, Add to Cart button.
7. **Shared Moments** — photo gallery strip using provided lifestyle photos
   (static assets in `web/public/`).
8. **Testimonials** — "What Parents Say", static content for now.
9. **Newsletter** — "Get 10% off your first order" email input; Phase 1 shows a
   success toast only (no persistence); wired to backend in a later phase.
10. **Footer** — link columns (Shop, Company, Support), payment method mentions
    (PayHere, Cash on Delivery, Bank Transfer), socials, copyright.

### Cart store

Zustand store persisted to localStorage: items (productId, name, price snapshot for
display only, imageUrl, quantity), add/remove/updateQuantity/clear, derived item count.
Header badge and Add to Cart use it. Checkout (later) re-validates everything
server-side; the stored price is display-only.

### Design system

- Tailwind theme tokens for the brand palette — never hardcoded hex in components:
  indigo `#1b0b80` (base), sky `#38b6ff`, gold `#ffc300`, berry `#ed3f7f`, plus
  supporting tokens from the template (cream `#fff4e0`, paper `#fffdf8`, ink
  `#1c1530`, ink-soft, line, and deep variants of sky/gold/berry).
- Fonts via `next/font`: Baloo 2 (display) + Fredoka (body) — the template's
  web-friendly interpretation of the brand's Chewy/Helvetica.
- UI primitives first (`components/ui/`): Button, Badge, PriceTag, Skeleton,
  SectionHeading, Input. Feature components (`components/features/home/`,
  `components/features/cart/`) composed from them. Files within
  frontend-standards size limits.

### SEO & performance

- Root layout: `metadataBase`, title template, description, OpenGraph defaults,
  favicon from `site icon.png`.
- All images via `next/image` (hero/first products `priority`); fonts via
  `next/font`; `loading.tsx` with skeletons for the home route;
  `app/robots.ts` + `app/sitemap.ts`.
- Semantic HTML (header/nav/main/section/footer), accessible labels on icon buttons.

## Error handling

- **API:** services throw `AppError(message, statusCode)`; controllers
  `next(error)`; central errorHandler logs (warn for operational, error for
  unexpected) and returns safe JSON. No stack traces to clients.
- **Web:** route-level `error.tsx` with a friendly retry UI; if the API is
  unreachable at render time, data sections degrade gracefully (empty states)
  rather than crashing the page. Toasts for client-side action feedback.

## Testing

- **API (Jest + Supertest):** unit tests for ProductService/CategoryService with
  mocked repositories; integration tests for both endpoints against a test database
  (`DATABASE_URL_TEST`), including query-validation failure cases; unit tests for
  the auth middleware (valid/invalid/missing JWT).
- **Web (Vitest + RTL + MSW):** ProductCard rendering (price, discount badge, age
  badge), cart store behavior (add/remove/persist), header badge count. MSW for
  API mocks.

## Explicitly deferred to later phases

Auth flows and profile, product listing/detail pages, functional search, reviews,
wishlist persistence, checkout + PayHere + COD, coupons, order emails, admin panel,
newsletter persistence, analytics. The Phase 1 schema, API layering, and cart store
are shaped so each arrives additively.
