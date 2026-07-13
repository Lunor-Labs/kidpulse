/**
 * Promote a Supabase user to staff or super_admin.
 *
 * Usage (from api/):
 *   npm run admin:promote -- <email> [role]
 *
 * Examples:
 *   npm run admin:promote -- mdkpjayashan@gmail.com super_admin
 *   npm run admin:promote -- staff@kidpulse.lk staff
 *   npm run admin:promote -- mdkpjayashan@gmail.com customer   # demote back
 *
 * If the user has never signed in yet, this script will refuse — sign up first,
 * then run the script to elevate.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

type Role = 'customer' | 'staff' | 'super_admin';

const VALID_ROLES: Role[] = ['customer', 'staff', 'super_admin'];

async function main() {
  const email = process.argv[2];
  const roleArg = (process.argv[3] ?? 'super_admin') as Role;

  if (!email) {
    console.error('Usage: npm run admin:promote -- <email> [role]');
    process.exit(1);
  }
  if (!VALID_ROLES.includes(roleArg)) {
    console.error(`Invalid role: ${roleArg}. Expected one of ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Paginate through users until we find the target email.
  const PAGE = 100;
  let page = 1;
  let target: { id: string; email?: string; app_metadata?: Record<string, unknown> } | null = null;

  while (!target) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) {
      console.error('listUsers failed:', error.message);
      process.exit(1);
    }
    const match = data.users.find(
      (u) => (u.email ?? '').toLowerCase() === email.toLowerCase()
    );
    if (match) {
      target = match;
      break;
    }
    if (data.users.length < PAGE) break;
    page += 1;
  }

  if (!target) {
    console.error(
      `No user found for ${email}. Have they signed up at /register yet? Do that first, then rerun.`
    );
    process.exit(1);
  }

  const currentRole =
    (target.app_metadata as { role?: string } | undefined)?.role ?? 'customer';

  const { error: updateError } = await supabase.auth.admin.updateUserById(target.id, {
    app_metadata: { ...(target.app_metadata ?? {}), role: roleArg },
  });

  if (updateError) {
    console.error('updateUserById failed:', updateError.message);
    process.exit(1);
  }

  console.log(`✓ ${email}: ${currentRole} → ${roleArg}`);
  console.log('Sign out and sign back in for the new JWT to take effect.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
