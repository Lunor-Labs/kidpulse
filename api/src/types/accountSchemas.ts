import { z } from 'zod';

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(120).nullable().optional(),
  phone: z.string().trim().min(6).max(20).nullable().optional(),
});

export const addressSchema = z.object({
  label: z.string().trim().max(40).nullable().optional(),
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(20),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().min(1).max(80),
  district: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().max(80).optional(),
  isDefault: z.boolean().optional(),
});

export const wishlistToggleSchema = z.object({
  productId: z.string().trim().min(1),
});

export const reviewSubmitSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).nullable().optional(),
  body: z.string().trim().min(1).max(2000),
});

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().max(160),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().min(1).max(80),
  district: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().max(80).optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1).nullable().optional(),
  quantity: z.number().int().min(1).max(99),
});

export const couponValidateSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().nonnegative().max(10_000_000),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  addressId: z.string().trim().min(1).nullable().optional(),
  shippingAddress: shippingAddressSchema.nullable().optional(),
  paymentMethod: z.enum(['PAYHERE', 'COD', 'BANK_TRANSFER']),
  couponCode: z.string().trim().max(40).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutShippingInput = z.infer<typeof shippingAddressSchema>;
