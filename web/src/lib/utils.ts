import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-US')}`;
}

export function discountPercent(price: number, compareAtPrice: number): number {
  return Math.round((1 - price / compareAtPrice) * 100);
}
