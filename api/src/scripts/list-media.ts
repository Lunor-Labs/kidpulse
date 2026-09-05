/**
 * List what is actually in the S3 bucket, with the public URL each object
 * resolves to.
 *
 * Exists because there is no other quick way to see it: Garage refuses
 * anonymous access, so the bucket cannot be browsed in a browser, and the
 * `garage` CLI manages buckets and keys but never lists object contents.
 * This reuses the same env and SDK the uploader does, so what it prints is
 * exactly what the app sees.
 *
 * Usage (from api/, loads ../.env):
 *   npm run media:ls
 *   npm run media:ls -- --prefix products/2026-09-05
 *   npm run media:ls -- --prefix banners --limit 20
 *   npm run media:ls -- --check          # HEAD each public URL, report status
 *
 * In a deployed container (compiled, no tsx needed):
 *   node dist/scripts/list-media.js --prefix products
 *
 * --check is the one that answers "is this image actually reachable?" — it
 * follows the same URL a browser would, so a non-200 there is exactly what a
 * visitor's <img> would hit.
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { env } from '../config/env';

function parseArgs(argv: string[]) {
  const flags: Record<string, string> = {};
  let check = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') {
      check = true;
      continue;
    }
    if (!arg.startsWith('--')) continue;
    const [name, inlineValue] = arg.slice(2).split(/=(.*)/s, 2);
    const value = inlineValue ?? argv[++i];
    if (value === undefined) {
      console.error(`Missing value for --${name}.`);
      process.exit(1);
    }
    flags[name] = value;
  }

  return { flags, check };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function publicUrlFor(key: string): string {
  return `${env.S3_PUBLIC_URL.replace(/\/+$/, '')}/${key}`;
}

async function main() {
  const { flags, check } = parseArgs(process.argv.slice(2));
  const prefix = flags.prefix;
  const limit = flags.limit ? Number(flags.limit) : Infinity;

  const client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  console.log(`Bucket:   ${env.S3_BUCKET}`);
  console.log(`Endpoint: ${env.S3_ENDPOINT}`);
  console.log(`Public:   ${env.S3_PUBLIC_URL}`);
  if (prefix) console.log(`Prefix:   ${prefix}`);
  console.log('');

  let continuationToken: string | undefined;
  let count = 0;
  let totalBytes = 0;
  let failures = 0;

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: env.S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of page.Contents ?? []) {
      if (count >= limit) break;
      const key = object.Key!;
      const size = object.Size ?? 0;
      count++;
      totalBytes += size;

      const modified = object.LastModified?.toISOString().slice(0, 19).replace('T', ' ') ?? '';
      console.log(`${modified}  ${formatSize(size).padStart(9)}  ${key}`);

      const url = publicUrlFor(key);
      if (!check) {
        console.log(`  ${url}`);
        continue;
      }

      // Deliberately a real request to the public URL rather than an S3 HEAD:
      // the point is to test the path a browser takes, proxy and all.
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const mark = response.ok ? 'OK ' : 'FAIL';
        if (!response.ok) failures++;
        console.log(`  [${mark} ${response.status}] ${url}`);
      } catch (error) {
        failures++;
        console.log(`  [FAIL --- ] ${url} (${error instanceof Error ? error.message : error})`);
      }
    }

    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken && count < limit);

  console.log('');
  if (count === 0) {
    console.log('No objects found.');
    return;
  }
  console.log(`${count} object(s), ${formatSize(totalBytes)} total.`);
  if (check) {
    console.log(
      failures === 0
        ? 'All public URLs reachable.'
        : `${failures} of ${count} public URL(s) NOT reachable — check S3_PUBLIC_URL.`
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
