'use client';

import { apiClient } from './apiClient';
import type {
  BankTransferInfo,
  CheckoutInput,
  CheckoutResult,
  CouponValidation,
  Order,
  PayHereStartFields,
} from '@/types/catalog';

export const storefrontApi = {
  placeOrder: (body: CheckoutInput, token: string | null) =>
    apiClient.post<CheckoutResult>('/api/v1/checkout', body, token),

  validateCoupon: (body: { code: string; subtotal: number }) =>
    apiClient.post<CouponValidation>('/api/v1/checkout/validate-coupon', body),

  listOrders: (token: string | null) =>
    apiClient.get<Order[]>('/api/v1/account/orders', token),

  getOrder: (orderNumber: string, token: string | null) =>
    apiClient.get<Order>(`/api/v1/account/orders/${orderNumber}`, token),

  startPayHere: (orderNumber: string, token: string | null) =>
    apiClient.post<PayHereStartFields>(
      `/api/v1/payments/payhere/start/${orderNumber}`,
      {},
      token
    ),

  getBankTransfer: (orderNumber: string, token: string | null) =>
    apiClient.get<BankTransferInfo>(`/api/v1/payments/bank-transfer/${orderNumber}`, token),
};
