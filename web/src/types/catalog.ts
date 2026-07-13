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

export interface Variant {
  id: string;
  label: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  sku: string | null;
  imageUrl: string | null;
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
  lowStockAlert?: number;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  category: { id: string; name: string; slug: string };
  images: ProductImage[];
  variants?: Variant[];
  avgRating?: number;
  reviewCount?: number;
}

export interface ProductSuggestion {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface ReviewList {
  avgRating: number;
  reviewCount: number;
  reviews: Review[];
}

export interface HomeBanner {
  id: string;
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
}

export interface ProductListFilters {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  limit?: number;
}

export interface ProductBanner {
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

export interface OrderItem {
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

export interface OrderShipping {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  country: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export type PaymentMethod = 'PAYHERE' | 'COD' | 'BANK_TRANSFER';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentAttempts?: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  couponCode: string | null;
  ship: OrderShipping;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  code: string;
  type: 'FIXED' | 'PERCENT';
  discountAmount: number;
  description: string | null;
}

export interface CheckoutResult {
  order: Order;
  createdAccount: boolean;
  emailVerificationSent: boolean;
}

export interface CheckoutShippingInput {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  postalCode?: string | null;
  country?: string;
}

export interface CheckoutInput {
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>;
  addressId?: string | null;
  shippingAddress?: CheckoutShippingInput | null;
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  notes?: string | null;
}

export interface PayHereStartFields {
  action: string;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  sandbox: '1' | '0';
}

export interface BankTransferInfo {
  order: {
    orderNumber: string;
    total: number;
    currency: string;
    customerName: string;
    email: string;
  };
  bank: {
    accountName: string | null;
    bankName: string | null;
    branch: string | null;
    accountNumber: string | null;
    whatsappNumber: string | null;
    deadlineDays: number;
  };
}
