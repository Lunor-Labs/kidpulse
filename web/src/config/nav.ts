export const NAV_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'Painting Kits', href: '/products?category=painting-kits' },
  { label: 'STEM Kits', href: '/products?category=stem-kits' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export interface AdminNavLink {
  href: string;
  label: string;
  superAdminOnly?: boolean;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/banners', label: 'Home banners' },
  { href: '/admin/product-banners', label: 'Product banners' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/discounts', label: 'Auto-discounts' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/staff', label: 'Staff', superAdminOnly: true },
  { href: '/admin/action-log', label: 'Action log', superAdminOnly: true },
];

export const ACCOUNT_NAV_LINKS = [
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/orders', label: 'My orders' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/cards', label: 'Saved cards' },
] as const;
