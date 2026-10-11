# KidPulse

E-commerce storefront for KidPulse craft kits (Lunor Labs).

## Structure
- `web/` — Next.js storefront (port 3000)
- `api/` — Express + Prisma API (port 4000)
- `supabase/` — local Supabase stack config (Docker)
- `deploy/` — Coolify compose template for the API
- `docs/` — specs and implementation plans
- `design/` — client-provided design reference and assets

## Local development
1. `supabase start` (Docker required) — Postgres on 54322, Storage/API on 54321
2. `cp .env.example .env` **in the repo root** — the API reads this file, not `api/.env`.
   Fill values from the `supabase start` output.
3. `cd api && npm install && npx prisma migrate dev && npm run seed && npm run dev`
4. `cd web && cp .env.example .env && npm install && npm run dev`

## Environment

The API loads the **root** `.env` (`api/src/config/env.ts`) and validates it with zod —
a missing or malformed value fails at startup rather than at request time. The web app
reads `web/.env`, falling back to the root `.env`.

| Variable | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | api | Postgres connection string |
| `JWT_SECRET` | api | Min 32 chars; signs staff/customer tokens |
| `ALLOWED_ORIGINS` | api | Comma-separated CORS origins. Entries are trimmed and trailing slashes stripped; a blank value aborts startup |
| `S3_*` | api | S3-compatible storage (endpoint, region, bucket, keys, public URL) |
| `API_URL` | web | API origin. Inlined into the **client bundle** via `next.config.ts`, so it must be publicly reachable — not an internal hostname |
| `SITE_URL` | web | Public site origin; backs `metadataBase`, sitemap, robots and product JSON-LD |
| `IMAGE_HOSTS` | web | Optional, comma-separated. Extra hosts allowed to serve `next/image` sources. `API_URL` is always allowed |

Three things that have bitten us:

- **A declared-but-blank variable is not the same as an unset one.** `FOO=` reaches the app
  as `''`, which slips past `??` and zod's `.default()`. Both `API_URL` and `ALLOWED_ORIGINS`
  now treat blank as unset; `SITE_URL` does not, so leaving it blank fails the web build with
  `Invalid URL`.
- **`API_URL` and `SITE_URL` are inlined at build time**, so changing them requires a redeploy,
  not just a restart.
- **Moving the API or storage host blanks every product image until the web app is
  rebuilt.** Image URLs are stored in the database as absolute URLs built from the API's
  `S3_PUBLIC_URL`, and `next/image` refuses any host missing from `images.remotePatterns`: the
  optimizer answers 400 and each image renders blank while uploads keep succeeding, so it
  reads as an upload bug. `web/next.config.ts` derives that allowlist from `API_URL` plus
  `IMAGE_HOSTS` rather than hardcoding hostnames. Keep `S3_PUBLIC_URL` pointed at
  `<API_URL>/media` (the proxy in `api/src/routes/media.ts`) so image URLs stay under a host
  the web build already knows about. Rows written before a move keep their old host, so
  that host has to stay reachable and be listed in `IMAGE_HOSTS` for those images to load.

## Creating an admin user

Staff logins live in the `staff_users` table with bcrypt-hashed passwords — they are not
Supabase Auth users. On a fresh database the table is empty, and the only in-app way to
create staff is an admin-authenticated endpoint, so the first account is made with a script:

```bash
cd api
npm run admin:create -- --email <email> --password <password> [--role <role>]
```

- `role` is `super_admin` (default) or `staff`.
- Positional arguments work too: `npm run admin:create -- <email> <password> [role]`.
- Existing accounts are left untouched unless you pass `--force`, which resets the password
  and re-activates the account.
- Set `STAFF_PASSWORD` instead of passing the password as an argument to keep it out of your
  shell history.

Only `DATABASE_URL` is required, so the same script runs against a deployed database. It
lives in `src/scripts/` so `npm run build` compiles it into `dist/` and it ships in the
production image — which installs `--omit=dev` and so has no `tsx`. From a shell in the
running container, where `DATABASE_URL` is already set, use `create-admin` — it runs the
compiled script directly and needs neither `tsx` nor `dotenv`:

```bash
npm run create-admin -- --email <email> --password <password>
```

Then sign in at `/login`. Once one `super_admin` exists, further staff can be added from
the `/admin/staff` page.

## Deployment

Both apps deploy from `dev` and `main` via GitHub Actions. Values come from
**environment-scoped** GitHub variables and secrets, so each one must be defined in both
the `dev` and `prod` environments — not just at repository level.

- `web/` → Vercel (`.github/workflows/deploy-web.yml`). The workflow writes `web/.env` from
  `vars.API_URL` and `vars.SITE_URL` before building. It writes those lines unconditionally,
  so an undefined variable becomes a blank value rather than an absent one.
- `api/` → image pushed to GHCR, `prisma migrate deploy` run over SSH, then a Coolify webhook
  redeploys (`.github/workflows/deploy-api.yml`). Runtime config lives in Coolify and is
  templated by `deploy/coolify/docker-compose.kidpulse.yml`.

The API sits behind Coolify's Traefik proxy and sets `trust proxy` to a single hop, so
rate limiting keys off the real client IP.

### Schema changes

`prisma db push` does not create migration files, and the deploy pipeline only runs
`prisma migrate deploy` — so a table added with `db push` will exist locally and be missing
in production. Use `npx prisma migrate dev --name <change>` and commit the generated
migration.
