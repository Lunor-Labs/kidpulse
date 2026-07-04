import { readFileSync } from 'node:fs';
import path from 'node:path';
import WebSocket from 'ws';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env';
import { logger } from '../src/lib/logger';

// Node 20 has no global WebSocket; @supabase/supabase-js's realtime client needs one even though this script never uses realtime.
(globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket;

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
