export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface AdminProductVariant {
  id: string;
  label: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminProduct {
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
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string; name: string; slug: string };
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  avgRating: number;
  reviewCount: number;
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

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface ProductFormValues {
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
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: string;
  images: Array<{ url: string; altText: string | null; sortOrder: number }>;
  variants: Array<{
    id: string | null;
    label: string;
    sku: string | null;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    imageUrl: string | null;
    sortOrder: number;
    isActive: boolean;
  }>;
}

export interface ImageUploadResult {
  url: string;
  path: string;
}

export interface AdminHomeBanner {
  id: string;
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeBannerFormValues {
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminProductBanner {
  id: string;
  productId: string | null;
  productName: string | null;
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  gradient: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBannerFormValues {
  productId: string | null;
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  gradient: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminSettings {
  bankAccountName: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
  whatsappNumber: string | null;
  bankTransferDeadlineDays: number;
  supportEmail: string | null;
  updatedAt: string;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  district: string;
  itemCount: number;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productSlug: string | null;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrderPayment {
  id: string;
  provider: string;
  providerRef: string | null;
  status: string;
  amount: number;
  createdAt: string;
}

export interface AdminOrderStatusEvent {
  id: string;
  fromStatus: string | null;
  fromStatusLabel: string | null;
  toStatus: string;
  toStatusLabel: string;
  actorType: string;
  actorId: string | null;
  note: string | null;
  createdAt: string;
}

export interface AdminOrderShipping {
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

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentAttempts: number;
  allowedTransitions: string[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  couponCode: string | null;
  ship: AdminOrderShipping;
  notes: string | null;
  items: AdminOrderItem[];
  payments: AdminOrderPayment[];
  statusEvents: AdminOrderStatusEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderShippingUpdate {
  shipFullName?: string;
  shipPhone?: string;
  shipAddressLine1?: string;
  shipAddressLine2?: string | null;
  shipCity?: string;
  shipDistrict?: string;
  shipPostalCode?: string | null;
  shipCountry?: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  type: 'FIXED' | 'PERCENT';
  value: number;
  minSubtotal: number | null;
  maxRedemptions: number | null;
  perCustomerLimit: number | null;
  totalRedemptions: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFormValues {
  code: string;
  description: string | null;
  type: 'FIXED' | 'PERCENT';
  value: number;
  minSubtotal: number | null;
  maxRedemptions: number | null;
  perCustomerLimit: number | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface AdminAutoDiscount {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutoDiscountFormValues {
  name: string;
  categoryId: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface AdminQuantityDiscount {
  id: string;
  name: string;
  productId: string | null;
  productName: string | null;
  minQuantity: number;
  type: 'FIXED' | 'PERCENT';
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuantityDiscountFormValues {
  name: string;
  productId: string | null;
  minQuantity: number;
  type: 'FIXED' | 'PERCENT';
  value: number;
  isActive: boolean;
}

export interface AdminSpendThreshold {
  id: string;
  name: string;
  minSubtotal: number;
  type: 'FIXED' | 'PERCENT';
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpendThresholdFormValues {
  name: string;
  minSubtotal: number;
  type: 'FIXED' | 'PERCENT';
  value: number;
  isActive: boolean;
}

export interface AdminCustomerListItem {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  wishlistCount: number;
  reviewCount: number;
  lastOrderAt: string | null;
  createdAt: string;
}

export interface AdminCustomerListPage {
  data: AdminCustomerListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminCustomerAddress {
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

export interface AdminCustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface AdminCustomerReview {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  rating: number;
  title: string | null;
  body: string;
  isApproved: boolean;
  createdAt: string;
}

export interface AdminCustomerDetail {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  wishlistCount: number;
  reviewCount: number;
  addresses: AdminCustomerAddress[];
  recentOrders: AdminCustomerOrderSummary[];
  reviews: AdminCustomerReview[];
}

export interface SalesReportPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface PaymentMethodBreakdown {
  paymentMethod: string;
  orderCount: number;
  revenue: number;
}

export interface StatusBreakdown {
  status: string;
  orderCount: number;
}

export interface SalesReport {
  from: string;
  to: string;
  totals: {
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
    cancelledCount: number;
    failedCount: number;
  };
  series: SalesReportPoint[];
  paymentBreakdown: PaymentMethodBreakdown[];
  statusBreakdown: StatusBreakdown[];
}

export interface BestSellerRow {
  productId: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

export interface BestSellersReport {
  from: string;
  to: string;
  categoryId: string | null;
  sort: 'units' | 'revenue';
  rows: BestSellerRow[];
}

export interface SignupPoint {
  date: string;
  count: number;
}

export interface TopCustomerRow {
  userId: string;
  email: string;
  fullName: string | null;
  orderCount: number;
  totalSpent: number;
}

export interface WishlistTrendRow {
  productId: string;
  name: string;
  slug: string;
  wishlistCount: number;
}

export interface CustomerActivityReport {
  from: string;
  to: string;
  totals: {
    newCustomers: number;
    orderingCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
  };
  signups: SignupPoint[];
  topCustomers: TopCustomerRow[];
  wishlistTop: WishlistTrendRow[];
}

export interface AdminStaffRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: 'staff' | 'super_admin';
  isActive: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

export interface StaffCreateValues {
  email: string;
  password: string;
  fullName: string | null;
  role: 'staff' | 'super_admin';
}

export interface StaffUpdateValues {
  role: 'staff' | 'super_admin';
  isActive?: boolean;
}

export interface AdminActionLogEntry {
  id: string;
  actorId: string;
  actorEmail: string | null;
  actorRole: string;
  method: string;
  path: string;
  entity: string | null;
  entityId: string | null;
  statusCode: number;
  createdAt: string;
}

export interface AdminActionLogPage {
  data: AdminActionLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminSettingsFormValues {
  bankAccountName: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
  whatsappNumber: string | null;
  bankTransferDeadlineDays: number;
  supportEmail: string | null;
}
