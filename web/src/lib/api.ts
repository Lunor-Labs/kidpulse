import type { Category, Product } from '@/types/catalog';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export class ApiUnavailableError extends Error {}

async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  } catch {
    throw new ApiUnavailableError(`API unreachable: ${path}`);
  }
  if (!res.ok) throw new ApiUnavailableError(`API error ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/api/v1/categories');
}

export function getBestSellers(): Promise<Product[]> {
  return apiGet<Product[]>('/api/v1/products?bestseller=true&limit=8');
}
