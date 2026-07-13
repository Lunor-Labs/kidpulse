export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

export interface AdminCategoryDto extends CategoryDto {
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductDto extends Omit<ProductDto, 'variants'> {
  isActive: boolean;
  variants: AdminProductVariantDto[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  activeProducts: number;
  activeCategories: number;
  lowStock: number;
  outOfStock: number;
  totalReviews: number;
}

export interface ImageUploadResult {
  url: string;
  path: string;
}

export interface HomeBannerDto {
  id: string;
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
}

export interface AdminHomeBannerDto extends HomeBannerDto {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageDto {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductVariantDto {
  id: string;
  label: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  sortOrder: number;
}

export interface AdminProductVariantDto extends ProductVariantDto {
  isActive: boolean;
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
  lowStockAlert: number;
  tags: string[];
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string; name: string; slug: string };
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  avgRating: number;
  reviewCount: number;
}

export interface ProductSuggestionDto {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
}

export interface ReviewDto {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface ReviewListDto {
  avgRating: number;
  reviewCount: number;
  reviews: ReviewDto[];
}

export interface ProfileDto {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
}

export interface AddressDto {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface WishlistItemDto {
  id: string;
  addedAt: string;
  product: ProductDto;
}

export interface WishlistToggleResult {
  productId: string;
  inWishlist: boolean;
}

export interface ProductBannerDto {
  id: string;
  productId: string | null;
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  gradient: string | null;
  sortOrder: number;
}

export interface AdminProductBannerDto extends ProductBannerDto {
  isActive: boolean;
  productName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  variantId: string | null;
  productSlug: string | null;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentAttempts: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  couponCode: string | null;
  ship: {
    fullName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    district: string;
    postalCode: string | null;
    country: string;
  };
  notes: string | null;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationDto {
  code: string;
  type: 'FIXED' | 'PERCENT';
  discountAmount: number;
  description: string | null;
}

export interface CheckoutResultDto {
  order: OrderDto;
  createdAccount: boolean;
  emailVerificationSent: boolean;
}
