export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stockQuantity: number;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  category: { id: string; name: string; slug: string };
  images: ProductImage[];
}
