import { z } from 'zod';

const csv = (v: unknown) =>
  typeof v === 'string' && v.length > 0
    ? v.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

export const productListQuerySchema = z.object({
  bestseller: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  categoryId: z.string().min(1).optional(),
  category: z
    .string()
    .optional()
    .transform(csv),
  exclude: z.string().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minAge: z.coerce.number().int().min(0).optional(),
  maxAge: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'newest']).default('featured'),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productSearchQuerySchema = z.object({
  q: z.string().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export type ProductSearchQuery = z.infer<typeof productSearchQuerySchema>;
