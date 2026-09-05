/**
 * Rewrite stored image URLs that point at a stale/incorrect host to the
 * current correct one — the fallout of S3_PUBLIC_URL having been set wrong
 * at upload time. Every Category/ProductVariant/ProductImage/HomeBanner/
 * ProductBanner URL built while that env var was wrong now has the dead host
 * baked in, and neither the app nor a proxy redirect can fix that after the
 * fact: it has to be rewritten in place.
 *
 * Deliberately excludes OrderItem.imageUrl — that's a historical snapshot of
 * what the customer saw at purchase time, not a live product reference.
 *
 * Usage (from api/, loads ../.env):
 *   npm run fix-media-urls -- --from <old-host-or-prefix> --to <new-host-or-prefix>
 *
 * Prints a per-table count of matching rows and does nothing else unless
 * --apply is passed. Re-running after --apply finds zero matches, so it is
 * safe to run more than once.
 *
 * Example — the URL baked in while S3_PUBLIC_URL pointed at the storage
 * host directly, needing to move to the API's /media proxy:
 *   npm run fix-media-urls -- \
 *     --from https://web-peuxf8afd0boyagnnycxwjck.51.79.165.223.sslip.io/kidpulse-media \
 *     --to https://kidpulse-api.lunorlabs.com/media \
 *     --apply
 */

import { prisma } from '../lib/prisma';

function usage(message: string): never {
  console.error(`${message}\n`);
  console.error('Usage: npm run fix-media-urls -- --from <old-prefix> --to <new-prefix> [--apply]');
  process.exit(1);
}

function parseArgs(argv: string[]) {
  const flags: Record<string, string> = {};
  let apply = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--apply') {
      apply = true;
      continue;
    }
    if (!arg.startsWith('--')) continue;
    const [name, inlineValue] = arg.slice(2).split(/=(.*)/s, 2);
    const value = inlineValue ?? argv[++i];
    if (value === undefined) usage(`Missing value for --${name}.`);
    flags[name] = value;
  }

  return { flags, apply };
}

interface TargetColumn {
  label: string;
  findMany: (from: string) => Promise<{ id: string; value: string }[]>;
  update: (id: string, value: string) => Promise<unknown>;
}

function targets(from: string): TargetColumn[] {
  const startsWithFrom = { startsWith: from };
  return [
    {
      label: 'Category.imageUrl',
      findMany: async () =>
        (
          await prisma.category.findMany({
            where: { imageUrl: startsWithFrom },
            select: { id: true, imageUrl: true },
          })
        ).map((r) => ({ id: r.id, value: r.imageUrl! })),
      update: (id, value) => prisma.category.update({ where: { id }, data: { imageUrl: value } }),
    },
    {
      label: 'ProductVariant.imageUrl',
      findMany: async () =>
        (
          await prisma.productVariant.findMany({
            where: { imageUrl: startsWithFrom },
            select: { id: true, imageUrl: true },
          })
        ).map((r) => ({ id: r.id, value: r.imageUrl! })),
      update: (id, value) =>
        prisma.productVariant.update({ where: { id }, data: { imageUrl: value } }),
    },
    {
      label: 'ProductImage.url',
      findMany: async () =>
        (
          await prisma.productImage.findMany({
            where: { url: startsWithFrom },
            select: { id: true, url: true },
          })
        ).map((r) => ({ id: r.id, value: r.url })),
      update: (id, value) => prisma.productImage.update({ where: { id }, data: { url: value } }),
    },
    {
      label: 'HomeBanner.imageUrl',
      findMany: async () =>
        (
          await prisma.homeBanner.findMany({
            where: { imageUrl: startsWithFrom },
            select: { id: true, imageUrl: true },
          })
        ).map((r) => ({ id: r.id, value: r.imageUrl! })),
      update: (id, value) => prisma.homeBanner.update({ where: { id }, data: { imageUrl: value } }),
    },
    {
      label: 'ProductBanner.imageUrl',
      findMany: async () =>
        (
          await prisma.productBanner.findMany({
            where: { imageUrl: startsWithFrom },
            select: { id: true, imageUrl: true },
          })
        ).map((r) => ({ id: r.id, value: r.imageUrl! })),
      update: (id, value) =>
        prisma.productBanner.update({ where: { id }, data: { imageUrl: value } }),
    },
  ];
}

async function main() {
  const { flags, apply } = parseArgs(process.argv.slice(2));
  const from = flags.from?.replace(/\/+$/, '');
  const to = flags.to?.replace(/\/+$/, '');

  if (!from) usage('Missing <old-prefix> (--from).');
  if (!to) usage('Missing <new-prefix> (--to).');
  if (from === to) usage('--from and --to are the same value.');

  let totalMatched = 0;
  for (const target of targets(from)) {
    const rows = await target.findMany(from);
    totalMatched += rows.length;
    console.log(`${target.label}: ${rows.length} row(s) match "${from}"`);

    if (!apply || rows.length === 0) continue;

    for (const row of rows) {
      const next = to + row.value.slice(from.length);
      await target.update(row.id, next);
    }
    console.log(`  -> rewritten to "${to}"`);
  }

  if (totalMatched === 0) {
    console.log('No matching rows found — nothing to do.');
  } else if (!apply) {
    console.log(`\n${totalMatched} row(s) would be updated. Re-run with --apply to write them.`);
  } else {
    console.log(`\n${totalMatched} row(s) updated.`);
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
