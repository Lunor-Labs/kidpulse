import { z } from 'zod';

const slugRule = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case');

export const categoryUpsertSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugRule,
  description: z.string().trim().max(2000).nullable().optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().trim().max(160).nullable().optional(),
  metaDescription: z.string().trim().max(320).nullable().optional(),
});

const imageInputSchema = z.object({
  url: z.string().trim().url(),
  altText: z.string().trim().max(200).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

const variantInputSchema = z.object({
  id: z.string().trim().min(1).nullable().optional(),
  label: z.string().trim().min(1).max(80),
  sku: z.string().trim().max(80).nullable().optional(),
  price: z.number().nonnegative().max(10_000_000),
  compareAtPrice: z.number().nonnegative().max(10_000_000).nullable().optional(),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  imageUrl: z.string().trim().url().nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  isActive: z.boolean().optional(),
});
export type VariantInput = z.infer<typeof variantInputSchema>;

export const productUpsertSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: slugRule,
  description: z.string().trim().min(1).max(5000),
  price: z.number().nonnegative().max(10_000_000),
  compareAtPrice: z.number().nonnegative().max(10_000_000).nullable().optional(),
  sku: z.string().trim().min(1).max(80),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  lowStockAlert: z.number().int().min(0).max(1_000_000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  ageRangeMin: z.number().int().min(0).max(18).nullable().optional(),
  ageRangeMax: z.number().int().min(0).max(18).nullable().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().trim().max(160).nullable().optional(),
  metaDescription: z.string().trim().max(320).nullable().optional(),
  categoryId: z.string().trim().min(1),
  images: z.array(imageInputSchema).max(12).default([]),
  variants: z.array(variantInputSchema).max(30).default([]),
});

export const bannerUpsertSchema = z.object({
  eyebrow: z.string().trim().max(80).nullable().optional(),
  headline: z.string().trim().min(1).max(160),
  subheadline: z.string().trim().max(280).nullable().optional(),
  imageUrl: z.string().trim().url(),
  ctaLabel: z.string().trim().max(40).nullable().optional(),
  ctaHref: z.string().trim().max(400).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export type BannerUpsertInput = z.infer<typeof bannerUpsertSchema>;

export const productBannerUpsertSchema = z.object({
  productId: z.string().trim().min(1).nullable().optional(),
  eyebrow: z.string().trim().max(80).nullable().optional(),
  headline: z.string().trim().min(1).max(160),
  subheadline: z.string().trim().max(280).nullable().optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  ctaLabel: z.string().trim().max(40).nullable().optional(),
  ctaHref: z.string().trim().max(400).nullable().optional(),
  gradient: z.string().trim().max(400).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export type ProductBannerUpsertInput = z.infer<typeof productBannerUpsertSchema>;

export const couponUpsertSchema = z.object({
  code: z.string().trim().min(1).max(40),
  description: z.string().trim().max(280).nullable().optional(),
  type: z.enum(['FIXED', 'PERCENT']),
  value: z.number().nonnegative().max(1_000_000),
  minSubtotal: z.number().nonnegative().max(10_000_000).nullable().optional(),
  maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().optional(),
  perCustomerLimit: z.number().int().min(1).max(1_000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CouponUpsertInput = z.infer<typeof couponUpsertSchema>;

export const autoDiscountUpsertSchema = z.object({
  name: z.string().trim().min(1).max(120),
  categoryId: z.string().trim().min(1),
  type: z.enum(['FIXED', 'PERCENT']),
  value: z.number().nonnegative().max(1_000_000),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});
export type AutoDiscountUpsertInput = z.infer<typeof autoDiscountUpsertSchema>;

export const quantityDiscountUpsertSchema = z.object({
  name: z.string().trim().min(1).max(120),
  productId: z.string().trim().min(1).nullable().optional(),
  minQuantity: z.number().int().min(2).max(1_000),
  type: z.enum(['FIXED', 'PERCENT']),
  value: z.number().nonnegative().max(1_000_000),
  isActive: z.boolean().optional(),
});
export type QuantityDiscountUpsertInput = z.infer<typeof quantityDiscountUpsertSchema>;

export const spendThresholdUpsertSchema = z.object({
  name: z.string().trim().min(1).max(120),
  minSubtotal: z.number().nonnegative().max(10_000_000),
  type: z.enum(['FIXED', 'PERCENT']),
  value: z.number().nonnegative().max(1_000_000),
  isActive: z.boolean().optional(),
});
export type SpendThresholdUpsertInput = z.infer<typeof spendThresholdUpsertSchema>;

export const adminSettingsSchema = z.object({
  bankAccountName: z.string().trim().max(120).nullable().optional(),
  bankName: z.string().trim().max(120).nullable().optional(),
  bankBranch: z.string().trim().max(120).nullable().optional(),
  bankAccountNumber: z.string().trim().max(64).nullable().optional(),
  whatsappNumber: z.string().trim().max(32).nullable().optional(),
  bankTransferDeadlineDays: z.number().int().min(1).max(30).optional(),
  supportEmail: z.string().trim().email().nullable().optional(),
});

export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'FAILED',
  ]),
  note: z.string().trim().max(500).nullable().optional(),
});
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;

export const orderShippingUpdateSchema = z.object({
  shipFullName: z.string().trim().min(1).max(120).optional(),
  shipPhone: z.string().trim().min(6).max(32).optional(),
  shipAddressLine1: z.string().trim().min(1).max(200).optional(),
  shipAddressLine2: z.string().trim().max(200).nullable().optional(),
  shipCity: z.string().trim().min(1).max(80).optional(),
  shipDistrict: z.string().trim().min(1).max(80).optional(),
  shipPostalCode: z.string().trim().max(20).nullable().optional(),
  shipCountry: z.string().trim().min(1).max(80).optional(),
});
export type OrderShippingUpdateInput = z.infer<typeof orderShippingUpdateSchema>;

export const bankPaymentActionSchema = z.object({
  note: z.string().trim().max(500).nullable().optional(),
});
export type BankPaymentActionInput = z.infer<typeof bankPaymentActionSchema>;

export const reviewModerationSchema = z.object({
  isApproved: z.boolean(),
});
export type ReviewModerationInput = z.infer<typeof reviewModerationSchema>;

export const staffCreateSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(12).max(200),
  fullName: z.string().trim().max(160).nullable().optional(),
  role: z.enum(['staff', 'super_admin']),
});
export type StaffCreateInput = z.infer<typeof staffCreateSchema>;

export const staffUpdateSchema = z.object({
  role: z.enum(['staff', 'super_admin']),
  isActive: z.boolean().optional(),
});
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;

export const imageUploadSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z
    .string()
    .trim()
    .regex(/^image\/(png|jpe?g|webp|gif)$/i, 'Unsupported image type'),
  dataBase64: z
    .string()
    .trim()
    .min(1)
    .max(6_000_000, 'Image is too large (max ~4MB)'),
  folder: z.enum(['products', 'categories', 'banners', 'product-banners']).default('products'),
});

export type CategoryUpsertInput = z.infer<typeof categoryUpsertSchema>;
export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
