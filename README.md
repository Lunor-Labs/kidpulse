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
