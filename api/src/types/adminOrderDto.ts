export interface AdminOrderListItemDto {
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

export interface AdminOrderItemDto {
  id: string;
  productId: string;
  productSlug: string | null;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrderPaymentDto {
  id: string;
  provider: string;
  providerRef: string | null;
  status: string;
  amount: number;
  createdAt: string;
}

export interface AdminOrderStatusEventDto {
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

export interface AdminOrderShippingDto {
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

export interface AdminOrderDetailDto {
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
  ship: AdminOrderShippingDto;
  notes: string | null;
  items: AdminOrderItemDto[];
  payments: AdminOrderPaymentDto[];
  statusEvents: AdminOrderStatusEventDto[];
  createdAt: string;
  updatedAt: string;
}
