---
name: frontend-standards
description: Use when building or modifying Next.js pages, components, layouts, hooks, or any UI — enforces industry-standard conventions for Next.js + TypeScript + Tailwind CSS projects
---

# Frontend Standards

Rigid skill — follow exactly. Auto-trigger when working on components, pages, layouts, hooks, or UI changes.

## Stack

Next.js 14+ (App Router) · TypeScript (strict) · Tailwind CSS · ESLint · Prettier

**Hard rules:**
- App Router only — no Pages Router patterns
- No `any` types — use proper TypeScript throughout
- No inline styles — Tailwind only
- No default exports for components — named exports always
- `use client` only when required — prefer Server Components

## Folder Structure

```
src/
  app/                    # App Router — pages, layouts, loading, error
    (auth)/               # Route groups for shared layouts
    api/                  # Route Handlers
    layout.tsx            # Root layout
    page.tsx              # Home page
  components/
    ui/                   # Reusable primitives (Button, Input, Modal)
    features/             # Feature-specific components
      <feature>/          # One subfolder per feature
  hooks/                  # Custom React hooks (client-side only)
  lib/                    # Utilities, API clients, helpers
  services/               # Business logic, external API calls
  types/                  # Shared TypeScript interfaces/types
  styles/                 # global.css, Tailwind config
  config/                 # App-wide constants, env validation
```

**Rules:**
- One non-trivial component per file
- File name matches exported component name (PascalCase)
- Hooks prefixed with `use` in `hooks/`
- Types co-located with their feature, shared types in `types/`

## Server vs Client Components

```tsx
// Default — Server Component (no directive needed)
// Can: fetch data, access backend, reduce JS bundle
export function ProductList() {
  const products = await fetchProducts(); // direct async/await
  return <ul>{products.map(p => <ProductCard key={p.id} product={p} />)}</ul>;
}

// 'use client' — only when you need:
// - useState / useEffect / event handlers
// - browser APIs / third-party client libs
'use client';
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  ...
}
```

**Rule:** Push `use client` as far down the tree as possible — keep data fetching in Server Components.

## Component Conventions

```tsx
// Named export, props typed with interface
interface ProductCardProps {
  product: Product;
  onSelect?: (id: string) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      ...
    </div>
  );
}
```

- Props defined with `interface`, not `type`
- Optional props use `?` — never default to `undefined` without intent
- No logic beyond rendering and calling hooks
- Extract reusable UI to `components/ui/`

## Modular Component Design

**Core principle:** Every component does one thing and can be understood in isolation.

### Component Hierarchy

```
components/ui/          ← Primitives: Button, Input, Badge, Modal, Skeleton
components/features/    ← Composed from primitives: ProductCard, OrderSummary
app/**/page.tsx         ← Pages: compose feature components, own layout
```

Build up: primitives → feature components → pages. Never skip levels (pages importing raw HTML instead of using ui/ primitives).

### Single Responsibility

```tsx
// ❌ Too much — renders, fetches, and handles business logic
export function ProductPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetch('/api/products').then(...) }, []);
  const handleDiscount = (id) => { /* business logic */ };
  return <div>...200 lines...</div>;
}

// ✅ Split by concern
export function ProductPage() {           // layout only
  return <main><ProductList /></main>;
}

export function ProductList() {           // data + list rendering
  const { products, loading } = useProducts();
  return products.map(p => <ProductCard key={p.id} product={p} />);
}

export function ProductCard({ product }) { // single item rendering
  return <div>...</div>;
}
```

### File Size Limits

| File type | Max lines | Signal when exceeded |
|---|---|---|
| Component file | **150 lines** | Doing too much — split into smaller components |
| Page file (`page.tsx`) | **100 lines** | Not delegating enough to feature components |
| Hook file | **100 lines** | Multiple concerns — split into focused hooks |
| Service / utility | **300 lines** | Group only closely related helpers |

Line count is a symptom, not the rule — but it's a reliable trigger. When a file grows past its limit, look for a natural seam to extract.

### When to Split a Component

Split when any of these are true:
- Component file exceeds **150 lines**
- Same UI pattern appears in 2+ places
- Part of the component has different `loading`/`error` states
- A section needs its own `use client` boundary

### Presentational vs Container Components

```tsx
// Presentational — pure rendering, no data fetching, easily testable
export function PriceTag({ amount, currency = 'USD' }: PriceTagProps) {
  return <span className="font-mono">{formatPrice(amount, currency)}</span>;
}

// Container — owns data fetching via hooks, passes data down
export function ProductPriceWidget({ productId }: { productId: string }) {
  const { price, loading } = useProductPrice(productId);
  if (loading) return <Skeleton className="w-20 h-5" />;
  return <PriceTag amount={price} />;
}
```

- Prefer presentational components — they're easier to test and reuse
- Container components only at feature boundaries, not nested inside other containers
- Never fetch data inside a presentational component

### Composition over Props Drilling

```tsx
// ❌ Prop drilling — passing props 3+ levels deep
<Page user={user}>
  <Layout user={user}>
    <Header user={user} />
  </Layout>
</Page>

// ✅ Composition — pass components as children/slots
<Page>
  <Layout header={<Header />}>
    <Content />
  </Layout>
</Page>

// ✅ Context — for truly global state (auth, theme)
const { user } = useAuth(); // inside Header, reads from AuthContext
```

Prop drilling beyond 2 levels is a signal to use composition or context.

## TypeScript Rules

```ts
// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

// Avoid — use specific types
const data: any = fetch(...);           // ❌
const handler = (e: any) => {};        // ❌

// Prefer
const data: Product[] = await fetch(...).then(r => r.json()); // ✅
const handler = (e: React.ChangeEvent<HTMLInputElement>) => {}; // ✅
```

- `tsconfig.json` must have `"strict": true`
- Shared types in `src/types/` — never duplicate
- Use `zod` for runtime validation at API boundaries
- Prefer `interface` for object shapes, `type` for unions/intersections

## Tailwind Conventions

```tsx
// Responsive: mobile-first, md: for desktop
<div className="flex flex-col md:flex-row gap-4">

// Conditional classes — use clsx or cn()
import { cn } from '@/lib/utils';
<button className={cn(
  'rounded-md px-4 py-2 font-medium',
  isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
)}>

// Extract repeated patterns to components, not @apply
```

**Rules:**
- Mobile-first — base styles for mobile, `md:` for desktop
- Never hardcode hex/rgb values — use Tailwind tokens
- No `@apply` in production code — extract to components instead
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes

## Data Fetching Patterns

```tsx
// Server Component — fetch directly (Next.js caches automatically)
async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 } // ISR: revalidate every 60s
  }).then(r => r.json());
  return <ProductList products={products} />;
}

// Client Component — use SWR or React Query
'use client';
import useSWR from 'swr';

export function LiveStockWidget({ productId }: { productId: string }) {
  const { data, error, isLoading } = useSWR(`/api/stock/${productId}`);
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <StockBadge count={data.count} />;
}
```

**Rules:**
- Server Components: fetch directly with `async/await`
- Client Components: SWR or React Query — never raw `useEffect` + `fetch`
- Always handle `loading` and `error` states
- Use Route Handlers (`app/api/`) for client-side mutations

## SEO

```tsx
// app/products/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: `${product.name} | Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      images: [product.imageUrl],
    },
  };
}

// app/layout.tsx — root metadata defaults
export const metadata: Metadata = {
  metadataBase: new URL('https://yoursite.com'),
  title: { default: 'Site Name', template: '%s | Site Name' },
  robots: { index: true, follow: true },
};
```

**SEO checklist:**
- Every page has unique `title` and `description` via `generateMetadata`
- `metadataBase` set in root layout
- `next/image` for all images (automatic WebP, lazy load, LCP optimisation)
- `next/font` for fonts (eliminates layout shift)
- `app/sitemap.ts` for dynamic sitemap
- `app/robots.ts` for robots.txt
- Structured data (JSON-LD) for product/article pages

## Performance

```tsx
// Images — always next/image
import Image from 'next/image';
<Image src={src} alt={alt} width={800} height={600} priority={isAboveFold} />

// Fonts — always next/font
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });

// Lazy load heavy components
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // only if component uses browser APIs
});
```

**Performance checklist:**
- All images via `next/image` with explicit `width`/`height`
- Fonts via `next/font` — never `<link>` to Google Fonts directly
- `priority` on above-the-fold images (LCP element)
- Dynamic import for heavy components (charts, editors, maps)
- `loading.tsx` files for route-level suspense boundaries
- Bundle analysis: `npx @next/bundle-analyzer` before release

## Custom Hooks Pattern

```ts
// hooks/useProducts.ts
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>('/api/products');

  return {
    products: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refresh: mutate,
  };
}
```

- Always return `loading` and `error`
- Return plain objects, not arrays (unless the hook IS a list)
- Hooks never contain UI logic

## Testing

```tsx
// components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

it('renders product name and price', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  expect(screen.getByText('$29.99')).toBeInTheDocument();
});
```

**Stack:** Vitest + React Testing Library + MSW (API mocking)

**Rules:**
- Test behaviour, not implementation
- One `__tests__/` folder per feature directory
- MSW for mocking API calls — never mock `fetch` directly
- E2E tests with Playwright for critical user flows

See `security.md` and `deployment.md` for security and CI/CD standards.
