import { CategoryService } from '../CategoryService';
import { AppError } from '../../lib/AppError';

const row = {
  id: 'c1',
  name: 'Painting Kits',
  slug: 'painting-kits',
  description: null,
  imageUrl: null,
  sortOrder: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { products: 3 },
};

describe('CategoryService.getCategories', () => {
  it('maps rows to DTOs with productCount', async () => {
    const repo = { findActiveWithCounts: jest.fn().mockResolvedValue([row]) };
    const service = new CategoryService(repo as never);
    const result = await service.getCategories();
    expect(result).toEqual([
      {
        id: 'c1',
        name: 'Painting Kits',
        slug: 'painting-kits',
        description: null,
        imageUrl: null,
        sortOrder: 1,
        productCount: 3,
      },
    ]);
  });

  it('wraps repository failures in AppError 500', async () => {
    const repo = { findActiveWithCounts: jest.fn().mockRejectedValue(new Error('db down')) };
    const service = new CategoryService(repo as never);
    await expect(service.getCategories()).rejects.toThrow(AppError);
  });
});
