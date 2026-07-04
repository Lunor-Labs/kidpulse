import request from 'supertest';
import { app } from '../../app';
import { resetDb, createCategory, createProduct } from '../../tests-helpers/db';
import { prisma } from '../../lib/prisma';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('GET /api/v1/categories', () => {
  it('returns active categories ordered by sortOrder with active product counts', async () => {
    const painting = await createCategory({ name: 'Painting Kits', slug: 'painting-kits', sortOrder: 1 });
    await createCategory({ name: 'STEM Kits', slug: 'stem-kits', sortOrder: 2 });
    await createCategory({ name: 'Hidden', slug: 'hidden', isActive: false });
    await createProduct(painting.id);
    await createProduct(painting.id, { isActive: false });

    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].slug).toBe('painting-kits');
    expect(res.body.data[0].productCount).toBe(1);
    expect(res.body.data[1].productCount).toBe(0);
  });
});
