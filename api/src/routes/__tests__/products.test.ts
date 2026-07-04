import request from 'supertest';
import { app } from '../../app';
import { resetDb, createCategory, createProduct } from '../../tests-helpers/db';
import { prisma } from '../../lib/prisma';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('GET /api/v1/products', () => {
  it('returns active products with numeric prices and category', async () => {
    const cat = await createCategory({ slug: 'painting-kits', name: 'Painting Kits' });
    await createProduct(cat.id, { price: 2500, compareAtPrice: 12690 });
    await createProduct(cat.id, { isActive: false });

    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].price).toBe(2500);
    expect(res.body.data[0].compareAtPrice).toBe(12690);
    expect(res.body.data[0].category.slug).toBe('painting-kits');
  });

  it('filters by bestseller and respects limit', async () => {
    const cat = await createCategory();
    await createProduct(cat.id, { isBestSeller: true });
    await createProduct(cat.id, { isBestSeller: true });
    await createProduct(cat.id, { isBestSeller: false });

    const res = await request(app).get('/api/v1/products?bestseller=true&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].isBestSeller).toBe(true);
  });

  it('rejects invalid limit with 400', async () => {
    const res = await request(app).get('/api/v1/products?limit=999');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid query parameters');
  });
});
