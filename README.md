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

## Creating an admin user
Admins are just Supabase users with `app_metadata.role` set to `staff` or `super_admin`. To promote an existing user:

1. Sign the user up at `/register` (any email + password).
2. From `api/`, run:
   ```
   npm run admin:promote -- <email> super_admin
   ```
   Use `staff` for a limited admin. To demote, pass `customer`.
3. Sign out and sign back in — the new JWT will carry the role and the header will switch to the admin nav.

Requires `SUPABASE_SERVICE_ROLE_KEY` in the root `.env` (see `.env.example`). Once one `super_admin` exists, further staff can be created from the `/admin/staff` page.
