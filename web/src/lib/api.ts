import type {
  Category,
  HomeBanner,
  Product,
  ProductBanner,
  ProductListFilters,
  ProductSuggestion,
  ReviewList,
} from '@/types/catalog';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export class ApiUnavailableError extends Error {}

async function apiGet<T>(path: string, revalidate: number = 60): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
  } catch {
    throw new ApiUnavailableError(`API unreachable: ${path}`);
  }
  if (!res.ok) throw new ApiUnavailableError(`API error ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

async function apiGetFresh<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  } catch {
    throw new ApiUnavailableError(`API unreachable: ${path}`);
  }
  if (!res.ok) throw new ApiUnavailableError(`API error ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

function buildProductListQuery(filters: ProductListFilters): string {
  const p = new URLSearchParams();
  filters.categories?.forEach((c) => p.append('category', c));
  if (filters.minPrice !== undefined) p.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) p.set('maxPrice', String(filters.maxPrice));
  if (filters.minAge !== undefined) p.set('minAge', String(filters.minAge));
  if (filters.maxAge !== undefined) p.set('maxAge', String(filters.maxAge));
  if (filters.sort) p.set('sort', filters.sort);
  p.set('limit', String(filters.limit ?? 24));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/api/v1/categories');
}

export function getHomeBanners(): Promise<HomeBanner[]> {
  return apiGet<HomeBanner[]>('/api/v1/banners');
}

export function getBestSellers(): Promise<Product[]> {
  return apiGet<Product[]>('/api/v1/products?bestseller=true&limit=8');
}

export function getProducts(filters: ProductListFilters = {}): Promise<Product[]> {
  return apiGet<Product[]>(`/api/v1/products${buildProductListQuery(filters)}`);
}

export function getProductBySlug(slug: string): Promise<Product> {
  return apiGet<Product>(`/api/v1/products/${encodeURIComponent(slug)}`);
}

export function getRelatedProducts(categorySlug: string, excludeSlug: string): Promise<Product[]> {
  return apiGet<Product[]>(
    `/api/v1/products?category=${encodeURIComponent(categorySlug)}&exclude=${encodeURIComponent(excludeSlug)}&limit=4`
  );
}

export function getProductReviews(slug: string): Promise<ReviewList> {
  return apiGet<ReviewList>(`/api/v1/products/${encodeURIComponent(slug)}/reviews`, 30);
}

export function searchProducts(q: string, limit: number = 8): Promise<ProductSuggestion[]> {
  return apiGetFresh<ProductSuggestion[]>(
    `/api/v1/products/search?q=${encodeURIComponent(q)}&limit=${limit}`
  );
}

export function getProductBanner(productId: string): Promise<ProductBanner | null> {
  return apiGet<ProductBanner | null>(
    `/api/v1/product-banners?productId=${encodeURIComponent(productId)}`,
    120
  );
}
