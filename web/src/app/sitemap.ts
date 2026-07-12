import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/api';

const STATIC_PATHS = ['/', '/products', '/search', '/login', '/register'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  try {
    const categories = await getCategories();
    for (const c of categories) {
      entries.push({
        url: `${base}/products?category=${encodeURIComponent(c.slug)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } catch {
    /* API unavailable — skip */
  }

  try {
    const products = await getProducts({ limit: 1000 });
    for (const p of products) {
      entries.push({
        url: `${base}/products/${encodeURIComponent(p.slug)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch {
    /* API unavailable — skip */
  }

  return entries;
}
