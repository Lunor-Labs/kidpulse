/**
 * Create (or reset) a staff / super_admin login in the staff_users table.
 *
 * Exists because staff accounts are otherwise only creatable through an
 * admin-authenticated endpoint (AdminStaffService.create), which is a
 * chicken-and-egg on a fresh database: you need a staff login to make one.
 *
 * Usage (from api/, local dev — runs through tsx and loads ../.env):
 *   npm run admin:create -- --email <email> --password <password> [--role <role>]
 *
 * Inside a deployed container (runs the compiled dist/, no tsx needed):
 *   npm run create-admin -- --email <email> --password <password>
 *
 * Flags and positional arguments are both accepted:
 *   npm run admin:create -- admin@kidpulse.lk 'S3cret-pass'
 *   npm run admin:create -- --email staff@kidpulse.lk --password 'S3cret-pass' --role staff
 *   npm run admin:create -- --email admin@kidpulse.lk --password 'new-pass' --force
 *
 * `--force` resets the password of an existing account (and re-activates it)
 * instead of refusing. Without it the script never touches an existing row.
 *
 * To avoid putting the password in your shell history, set STAFF_PASSWORD
 * instead of passing it as an argument.
 *
 * Only DATABASE_URL is required, so this can be run straight against a
 * deployed database. It lives under src/ (rather than alongside the dev-only
 * scripts/) so that `npm run build` compiles it into dist/ and it ships in the
 * production image — which installs --omit=dev and therefore has no tsx.
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

type StaffRole = 'staff' | 'super_admin';

const VALID_ROLES: StaffRole[] = ['staff', 'super_admin'];
const MIN_PASSWORD_LENGTH = 8;
// Matches AdminStaffService.create so hashes are interchangeable.
const BCRYPT_ROUNDS = 12;

function usage(message: string): never {
  console.error(`${message}\n`);
  console.error(
    'Usage: npm run admin:create -- --email <email> --password <password> [--role <role>] [--force]'
  );
  console.error('       npm run admin:create -- <email> <password> [role] [--force]');
  console.error(`Roles: ${VALID_ROLES.join(' | ')} (default: super_admin)`);
  process.exit(1);
}

/**
 * Accepts `--email a@b.c` / `--email=a@b.c` flags as well as bare positional
 * arguments, so the same script works with either calling convention.
 */
function parseArgs(argv: string[]) {
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--force') {
      force = true;
      continue;
    }
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }

    const [name, inlineValue] = arg.slice(2).split(/=(.*)/s, 2);
    // `--email value` consumes the next argv entry; `--email=value` does not.
    const value = inlineValue ?? argv[++i];
    if (value === undefined) usage(`Missing value for --${name}.`);
    flags[name] = value;
  }

  return { flags, positional, force };
}

async function main() {
  const { flags, positional, force } = parseArgs(process.argv.slice(2));

  const [emailPositional, passwordPositional, rolePositional] = positional;
  const emailArg = flags.email ?? emailPositional;
  const roleArg = flags.role ?? rolePositional;
  const password = flags.password ?? passwordPositional ?? process.env.STAFF_PASSWORD;

  if (!emailArg) usage('Missing <email>.');
  if (!password) usage('Missing <password> (or set STAFF_PASSWORD).');
  if (password.length < MIN_PASSWORD_LENGTH) {
    usage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const role = (roleArg ?? 'super_admin') as StaffRole;
  if (!VALID_ROLES.includes(role)) {
    usage(`Invalid role: ${role}.`);
  }

  // The login route lowercases the submitted email before looking it up
  // (routes/auth.ts), so a mixed-case row here would never match.
  const email = emailArg.trim().toLowerCase();

  const existing = await prisma.staffUser.findUnique({ where: { email } });
  if (existing && !force) {
    console.error(`A staff account already exists for ${email} (role: ${existing.role}).`);
    console.error('Re-run with --force to reset its password.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  if (existing) {
    await prisma.staffUser.update({
      where: { email },
      data: { passwordHash, role, isActive: true },
    });
    console.log(`✓ Reset password for ${email} (role: ${role}, re-activated)`);
    return;
  }

  const created = await prisma.staffUser.create({
    data: { email, passwordHash, role, isActive: true },
  });
  console.log(`✓ Created staff account ${created.email} (role: ${created.role})`);
  console.log('Sign in at /login with these credentials.');
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
