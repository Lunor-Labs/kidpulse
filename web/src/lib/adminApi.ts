'use client';

import { apiClient } from './apiClient';
import type {
  AdminActionLogPage,
  AdminAutoDiscount,
  AdminCategory,
  AdminCoupon,
  AdminCustomerDetail,
  AdminCustomerListPage,
  AdminDashboardStats,
  AdminHomeBanner,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderShippingUpdate,
  AdminProduct,
  AdminProductBanner,
  AdminQuantityDiscount,
  AdminSettings,
  AdminSettingsFormValues,
  AdminSpendThreshold,
  AdminStaffRow,
  AutoDiscountFormValues,
  BestSellersReport,
  CategoryFormValues,
  CouponFormValues,
  CustomerActivityReport,
  HomeBannerFormValues,
  ImageUploadResult,
  ProductBannerFormValues,
  ProductFormValues,
  QuantityDiscountFormValues,
  SalesReport,
  SpendThresholdFormValues,
  StaffCreateValues,
  StaffUpdateValues,
} from '@/types/admin';

const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function buildRangeQs(filters: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function downloadCsv(
  path: string,
  filename: string,
  token: string | null
): Promise<void> {
  const res = await fetch(`${BROWSER_API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Download failed: ${res.statusText}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const adminApi = {
  dashboard: (token: string | null) =>
    apiClient.get<AdminDashboardStats>('/api/v1/admin/dashboard', token),

  listCategories: (token: string | null) =>
    apiClient.get<AdminCategory[]>('/api/v1/admin/categories', token),
  getCategory: (id: string, token: string | null) =>
    apiClient.get<AdminCategory>(`/api/v1/admin/categories/${id}`, token),
  createCategory: (body: CategoryFormValues, token: string | null) =>
    apiClient.post<AdminCategory>('/api/v1/admin/categories', body, token),
  updateCategory: (id: string, body: CategoryFormValues, token: string | null) =>
    apiClient.put<AdminCategory>(`/api/v1/admin/categories/${id}`, body, token),
  deleteCategory: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/categories/${id}`, token),

  listProducts: (token: string | null) =>
    apiClient.get<AdminProduct[]>('/api/v1/admin/products', token),
  getProduct: (id: string, token: string | null) =>
    apiClient.get<AdminProduct>(`/api/v1/admin/products/${id}`, token),
  createProduct: (body: ProductFormValues, token: string | null) =>
    apiClient.post<AdminProduct>('/api/v1/admin/products', body, token),
  updateProduct: (id: string, body: ProductFormValues, token: string | null) =>
    apiClient.put<AdminProduct>(`/api/v1/admin/products/${id}`, body, token),
  deleteProduct: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/products/${id}`, token),

  listBanners: (token: string | null) =>
    apiClient.get<AdminHomeBanner[]>('/api/v1/admin/banners', token),
  getBanner: (id: string, token: string | null) =>
    apiClient.get<AdminHomeBanner>(`/api/v1/admin/banners/${id}`, token),
  createBanner: (body: HomeBannerFormValues, token: string | null) =>
    apiClient.post<AdminHomeBanner>('/api/v1/admin/banners', body, token),
  updateBanner: (id: string, body: HomeBannerFormValues, token: string | null) =>
    apiClient.put<AdminHomeBanner>(`/api/v1/admin/banners/${id}`, body, token),
  deleteBanner: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/banners/${id}`, token),

  listProductBanners: (token: string | null) =>
    apiClient.get<AdminProductBanner[]>('/api/v1/admin/product-banners', token),
  getProductBanner: (id: string, token: string | null) =>
    apiClient.get<AdminProductBanner>(`/api/v1/admin/product-banners/${id}`, token),
  createProductBanner: (body: ProductBannerFormValues, token: string | null) =>
    apiClient.post<AdminProductBanner>('/api/v1/admin/product-banners', body, token),
  updateProductBanner: (id: string, body: ProductBannerFormValues, token: string | null) =>
    apiClient.put<AdminProductBanner>(`/api/v1/admin/product-banners/${id}`, body, token),
  deleteProductBanner: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/product-banners/${id}`, token),

  listOrders: (
    filters: { status?: string; q?: string; limit?: number },
    token: string | null
  ) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.q) params.set('q', filters.q);
    if (filters.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return apiClient.get<AdminOrderListItem[]>(
      `/api/v1/admin/orders${qs ? `?${qs}` : ''}`,
      token
    );
  },
  getOrder: (orderNumber: string, token: string | null) =>
    apiClient.get<AdminOrderDetail>(`/api/v1/admin/orders/${orderNumber}`, token),
  updateOrderStatus: (
    id: string,
    body: { status: string; note?: string | null },
    token: string | null
  ) => apiClient.put<AdminOrderDetail>(`/api/v1/admin/orders/${id}/status`, body, token),
  updateOrderShipping: (id: string, body: AdminOrderShippingUpdate, token: string | null) =>
    apiClient.put<AdminOrderDetail>(`/api/v1/admin/orders/${id}/shipping`, body, token),
  confirmBankPayment: (id: string, token: string | null) =>
    apiClient.post<AdminOrderDetail>(
      `/api/v1/admin/orders/${id}/payments/bank-confirm`,
      {},
      token
    ),
  cancelBankPayment: (
    id: string,
    body: { note?: string | null },
    token: string | null
  ) =>
    apiClient.post<AdminOrderDetail>(
      `/api/v1/admin/orders/${id}/payments/bank-cancel`,
      body,
      token
    ),

  listCoupons: (token: string | null) =>
    apiClient.get<AdminCoupon[]>('/api/v1/admin/coupons', token),
  getCoupon: (id: string, token: string | null) =>
    apiClient.get<AdminCoupon>(`/api/v1/admin/coupons/${id}`, token),
  createCoupon: (body: CouponFormValues, token: string | null) =>
    apiClient.post<AdminCoupon>('/api/v1/admin/coupons', body, token),
  updateCoupon: (id: string, body: CouponFormValues, token: string | null) =>
    apiClient.put<AdminCoupon>(`/api/v1/admin/coupons/${id}`, body, token),
  deleteCoupon: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/coupons/${id}`, token),

  listAutoDiscounts: (token: string | null) =>
    apiClient.get<AdminAutoDiscount[]>('/api/v1/admin/discounts/auto', token),
  createAutoDiscount: (body: AutoDiscountFormValues, token: string | null) =>
    apiClient.post<AdminAutoDiscount>('/api/v1/admin/discounts/auto', body, token),
  updateAutoDiscount: (id: string, body: AutoDiscountFormValues, token: string | null) =>
    apiClient.put<AdminAutoDiscount>(`/api/v1/admin/discounts/auto/${id}`, body, token),
  deleteAutoDiscount: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/discounts/auto/${id}`, token),

  listQuantityDiscounts: (token: string | null) =>
    apiClient.get<AdminQuantityDiscount[]>('/api/v1/admin/discounts/quantity', token),
  createQuantityDiscount: (body: QuantityDiscountFormValues, token: string | null) =>
    apiClient.post<AdminQuantityDiscount>('/api/v1/admin/discounts/quantity', body, token),
  updateQuantityDiscount: (
    id: string,
    body: QuantityDiscountFormValues,
    token: string | null
  ) =>
    apiClient.put<AdminQuantityDiscount>(
      `/api/v1/admin/discounts/quantity/${id}`,
      body,
      token
    ),
  deleteQuantityDiscount: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/discounts/quantity/${id}`, token),

  listSpendDiscounts: (token: string | null) =>
    apiClient.get<AdminSpendThreshold[]>('/api/v1/admin/discounts/spend', token),
  createSpendDiscount: (body: SpendThresholdFormValues, token: string | null) =>
    apiClient.post<AdminSpendThreshold>('/api/v1/admin/discounts/spend', body, token),
  updateSpendDiscount: (
    id: string,
    body: SpendThresholdFormValues,
    token: string | null
  ) =>
    apiClient.put<AdminSpendThreshold>(`/api/v1/admin/discounts/spend/${id}`, body, token),
  deleteSpendDiscount: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/discounts/spend/${id}`, token),

  listCustomers: (
    filters: { q?: string; limit?: number; offset?: number },
    token: string | null
  ) => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.offset) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return apiClient.get<AdminCustomerListPage>(
      `/api/v1/admin/customers${qs ? `?${qs}` : ''}`,
      token
    );
  },
  getCustomer: (id: string, token: string | null) =>
    apiClient.get<AdminCustomerDetail>(`/api/v1/admin/customers/${id}`, token),
  deleteReview: (reviewId: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/reviews/${reviewId}`, token),
  moderateReview: (reviewId: string, isApproved: boolean, token: string | null) =>
    apiClient.patch<{ id: string; isApproved: boolean }>(
      `/api/v1/admin/reviews/${reviewId}`,
      { isApproved },
      token
    ),

  getSalesReport: (
    filters: { from?: string; to?: string },
    token: string | null
  ) =>
    apiClient.get<SalesReport>(
      `/api/v1/admin/analytics/sales${buildRangeQs(filters)}`,
      token
    ),
  getBestSellers: (
    filters: {
      from?: string;
      to?: string;
      categoryId?: string;
      sort?: 'units' | 'revenue';
      limit?: number;
    },
    token: string | null
  ) =>
    apiClient.get<BestSellersReport>(
      `/api/v1/admin/analytics/bestsellers${buildRangeQs(filters)}`,
      token
    ),
  getCustomerActivity: (
    filters: { from?: string; to?: string },
    token: string | null
  ) =>
    apiClient.get<CustomerActivityReport>(
      `/api/v1/admin/analytics/customers${buildRangeQs(filters)}`,
      token
    ),

  getSettings: (token: string | null) =>
    apiClient.get<AdminSettings>('/api/v1/admin/settings', token),
  updateSettings: (body: AdminSettingsFormValues, token: string | null) =>
    apiClient.put<AdminSettings>('/api/v1/admin/settings', body, token),

  listStaff: (token: string | null) =>
    apiClient.get<AdminStaffRow[]>('/api/v1/admin/staff', token),
  createStaff: (body: StaffCreateValues, token: string | null) =>
    apiClient.post<AdminStaffRow>('/api/v1/admin/staff', body, token),
  updateStaff: (id: string, body: StaffUpdateValues, token: string | null) =>
    apiClient.put<AdminStaffRow>(`/api/v1/admin/staff/${id}`, body, token),
  deleteStaff: (id: string, token: string | null) =>
    apiClient.delete<void>(`/api/v1/admin/staff/${id}`, token),

  listActionLog: (
    filters: { limit?: number; offset?: number; entity?: string; actorId?: string },
    token: string | null
  ) => {
    const params = new URLSearchParams();
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.offset) params.set('offset', String(filters.offset));
    if (filters.entity) params.set('entity', filters.entity);
    if (filters.actorId) params.set('actorId', filters.actorId);
    const qs = params.toString();
    return apiClient.get<AdminActionLogPage>(
      `/api/v1/admin/action-log${qs ? `?${qs}` : ''}`,
      token
    );
  },

  uploadImage: (
    body: {
      filename: string;
      contentType: string;
      dataBase64: string;
      folder: 'products' | 'categories' | 'banners' | 'product-banners';
    },
    token: string | null
  ) => apiClient.post<ImageUploadResult>('/api/v1/admin/uploads/image', body, token),
};

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  return btoa(binary);
}
