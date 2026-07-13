import type { Product } from './catalog';

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
}

export interface Address {
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

export interface AddressInput {
  label?: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
}

export interface WishlistItem {
  id: string;
  addedAt: string;
  product: Product;
}
