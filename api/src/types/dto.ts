export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

export interface ProductImageDto {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductDto {
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
  images: ProductImageDto[];
}
