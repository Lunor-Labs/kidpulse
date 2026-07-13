/**
 * Create the kidpulse-media bucket (idempotent).
 *
 * Usage (from api/):
 *   npm run admin:storage:setup
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const BUCKET = 'kidpulse-media';

async function main() {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('listBuckets failed:', listError.message);
    process.exit(1);
  }

  const already = existing.find((b) => b.name === BUCKET);
  if (already) {
    console.log(`✓ Bucket "${BUCKET}" already exists (public=${already.public}).`);
    if (!already.public) {
      const { error: updErr } = await supabase.storage.updateBucket(BUCKET, {
        public: true,
      });
      if (updErr) {
        console.error('Could not flip bucket to public:', updErr.message);
        process.exit(1);
      }
      console.log(`  → updated to public.`);
    }
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 4 * 1024 * 1024, // 4MB matches API validation
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  });
  if (createError) {
    console.error('createBucket failed:', createError.message);
    process.exit(1);
  }
  console.log(`✓ Created public bucket "${BUCKET}" (max 4MB, images only).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
