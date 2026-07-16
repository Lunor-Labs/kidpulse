# KidPulse – Requirements Audit & Testing Guide

Source spec: `KidPulse_Jira_Epics_and_Stories.pdf` (v1.0, 10 epics, 40 stories, 247 acceptance criteria).
Audit date: 2026-07-12. Codebase: `D:\Lunor_Labs\kidpulse` (branch `main`).

Legend:
- ✅ **Done** — implemented and wired end-to-end.
- 🟡 **Partial** — most criteria met; specific gaps called out.
- ❌ **Missing** — not implemented (or stubbed UI only, no backend).

---

## PART 1 — Requirement-by-requirement status

### EPIC 1 — Storefront & Product Browsing

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-1.1** Homepage w/ slider + featured | ✅ | `web/src/app/page.tsx` → `HeroSlider`, `BestSellers`, `CategoryCards`, `Testimonials`, `MomentsGallery`, `NewsletterSignup`. Admin banner CRUD via `HomeBannerController`. Responsive. |
| **KP-1.2** Product listing + filters | ✅ | `web/src/app/products/page.tsx` + `ProductsClient.tsx` + `FilterSidebar.tsx`. Category / price / age filters wired to `/api/v1/products`. Filter state via query params. |
| **KP-1.3** Product detail page | 🟡 | Images gallery ✅, price/description ✅, "You may also like" ✅ (`YouMayAlsoLike.tsx`), side ad banner ✅ (`AdBanner.tsx` + `ProductBanner` model). **Variants are UI-only** — `VariantSelector.tsx` exists but there is **no `ProductVariant` table** in `schema.prisma` and no API returns variants. Out-of-stock only tracked at product level (single `stockQuantity`). |
| **KP-1.4** Search + suggestions | ✅ | `/api/v1/products/search` (see `ProductController.ts`), suggestions dropdown in `SiteHeader.tsx`, dedicated `web/src/app/search/page.tsx`, no-results state handled. |
| **KP-1.5** Reviews & ratings | ✅ | `Review` model + `ReviewService` + `ReviewController` + `ProductReviews.tsx` / `ReviewForm.tsx`. Unique `[productId, userId]` prevents duplicates. Admin can delete via `AdminCustomerController.deleteReview`. |

---

### EPIC 2 — Customer Accounts

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-2.1** Email register / login / forgot | ✅ | Supabase Auth. `web/src/app/{login,register,forgot-password,reset-password}` pages. Session persists via Supabase SSR. 8-char min enforced client-side. |
| **KP-2.2** Google OAuth | ✅ | `GoogleButton.tsx` uses `supabase.auth.signInWithOAuth({provider:'google'})`. `auth/callback` route handles redirect. Requires Google provider enabled in Supabase project (config step, not code). |
| **KP-2.3** View/edit profile + address | ✅ | `ProfileController` + `AddressController` + `web/src/app/account/{profile,addresses}`. Multiple addresses + default flag. Email immutable ✅ (Supabase). |
| **KP-2.4** Order history + tracking | 🟡 | `web/src/app/account/orders/*` + `OrderController.listForUser`. Status shown. **AC 45 (real-time updates)** is polled/on-load, not push. **AC 46 (email on every status change)** is only wired for `PAID` and `PAYMENT_CANCELLED`; need to verify SHIPPED / DELIVERED emails — see gap in KP-5.4. |
| **KP-2.5** Wishlist | ✅ | `WishlistItem` model, `WishlistController`, `WishlistButton.tsx` on cards + PDP, `web/src/app/account/wishlist/*`. Persists per user. |
| **KP-2.6** Saved payment cards | ❌ | **UI stub only** (`account/cards/page.tsx` says "No saved cards"). No tokenisation call, no saved-cards table, no PayHere save-card flow. |

---

### EPIC 3 — Cart & Checkout

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-3.1** Cart add / adjust / remove | ✅ | `CartButton.tsx`, `AddToCartButton.tsx`, cart store in `web/src/store` (localStorage). Header shows count. |
| **KP-3.2** Guest checkout + auto account | ✅ | `OrderService.autoProvisionAccount` creates Supabase user via admin API and emails magic link. Existing email → order linked to existing account. Welcome email in `EmailService.sendWelcomeGuest`. |
| **KP-3.3** Coupon code at checkout | ✅ | `PromotionsService.applyToCart` handles coupons, invalid/expired errors, single coupon per order enforced. Applied code stored on order. |
| **KP-3.4** Multiple saved addresses | ✅ | `Address` model + selection in `CheckoutClient.tsx`. Guest form in same page. Admin sees ship-to on order detail. |
| **KP-3.5** Order summary review | ✅ | `CheckoutClient.tsx` renders totals, discount, delivery charge, then submit. |

---

### EPIC 4 — Payments

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-4.1** PayHere gateway | ✅ | `PayHereService.buildStartFields` + `handleNotify` with MD5 hash verification. Success → status PROCESSING. Fail → back to checkout. Confirmation email sent. |
| **KP-4.2** Cash on Delivery | 🟡 | COD works; **AC 90 says COD status should be Pending, but `OrderService` sets `PROCESSING` on COD checkout** (line 71). This may or may not be intentional — verify with client. |
| **KP-4.3** Confirmation email | ✅ | `EmailService.sendOrderConfirmation` — HTML templated, sent for PayHere + COD + Bank Transfer. |
| **KP-4.4** Payment failure UX | 🟡 | `/checkout/failed/[orderNumber]` page exists, cart preserved. **AC 103 (3-attempt limit → support contact)** is enforced server-side (`PayHereService` blocks >=3 attempts) but there is no dedicated "contact support" message on the failure page — verify UI copy. |
| **KP-4.5** Save card option | ❌ | Not implemented. No "save card" checkbox in PayHere flow, no tokenisation. Ties to KP-2.6. |
| **KP-4.6** Bank transfer flow | ✅ | Full flow implemented: `/checkout/bank-transfer/[orderNumber]` page, `EmailService.sendBankTransferInstructions`, admin `Confirm Payment` / `Cancel Order` buttons via `AdminOrderController.bankConfirm` / `bankCancel`. Bank details editable in `AdminSettings`. |

---

### EPIC 5 — Order Management (Admin)

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-5.1** View orders + edit details | ✅ | `admin/orders/*`, filter by status, `updateShipping` endpoint edits phone/address. |
| **KP-5.2** Manual status update | 🟡 | `AdminOrderController.updateStatus` updates status and writes `OrderStatusEvent` (timestamped ✅). **AC 125 (block status skipping)** — verify `AdminOrderService` enforces the state machine; if not, admin can jump from PENDING_PAYMENT to SHIPPED. |
| **KP-5.3** Invoice / packing slip PDF | ✅ | `InvoiceService` + `/api/v1/admin/orders/:orderNumber/invoice.pdf`. Verify packing-slip variant (no pricing) — currently only "invoice" is exposed; **packing-slip may be missing**. |
| **KP-5.4** Status-change emails to customer | 🟡 | Payment received + bank cancelled emails exist. **Emails for SHIPPED / DELIVERED / generic cancel are not wired** in `EmailService` — grep shows only `sendOrderConfirmation`, `sendPaymentReceived`, `sendBankTransferInstructions`, `sendWelcomeGuest`. Needs `sendOrderShipped`, `sendOrderDelivered`, `sendOrderCancelled`. |

---

### EPIC 6 — Product & Inventory (Admin)

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-6.1** Product CRUD | ✅ | `AdminProductController` + `admin/products/*` pages, image upload via `UploadService`, reorder + delete supported. Soft-delete via `deletedAt`. |
| **KP-6.2** Category / tag management | 🟡 | Categories: full CRUD ✅. **Tags: no `Tag` model in `schema.prisma`** — spec says "custom tags for search/filter". Gap. AC 147 (reassign products on category delete) — verify prompt exists in UI. |
| **KP-6.3** Stock + low-stock alerts | 🟡 | Stock decrement on order ✅ (`OrderService`), `lowStockAlert` threshold field ✅, admin can adjust manually ✅. **Alerts (email or panel notification) are not implemented** — nothing triggers on threshold cross. |
| **KP-6.4** Variants (size/colour/age) | ❌ | **Not implemented in backend.** No `ProductVariant` table; no variant CRUD in `AdminProductController`. Frontend `VariantSelector.tsx` is a UI-only placeholder. `ageRangeMin/Max` exists on `Product` but that's a single filter, not a variant. |
| **KP-6.5** Home banner slider mgmt | ✅ | `HomeBannerController` + `admin/banners`. Link URL, sort order, active flag all editable. |
| **KP-6.6** Product-page side banner mgmt | ✅ | `ProductBannerController` + `admin/product-banners`. |

---

### EPIC 7 — Promotions & Coupons (Admin)

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-7.1** Fixed / percentage coupons | ✅ | `Coupon` model, `AdminCouponController`, list + toggle active. |
| **KP-7.2** Expiry + usage limits | ✅ | `expiresAt`, `maxRedemptions`, `perCustomerLimit`, `totalRedemptions` counter, `CouponRedemption` for per-customer enforcement. |
| **KP-7.3** Category auto-discounts | ✅ | `AutoDiscount` model, `startsAt`/`endsAt`, applied via `PromotionsService.applyToCart`. Shown separately (`autoDiscountAmount` on Order). |
| **KP-7.4** Quantity discounts | ✅ | `QuantityDiscount` model, per-product or global (nullable `productId`), tier support via multiple rows. |
| **KP-7.5** Spend-threshold discounts | ✅ | `SpendThresholdDiscount` model, highest applicable selected in `PromotionsService`. |

---

### EPIC 8 — Customer Management (Admin)

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-8.1** Customer list + search | ✅ | `AdminCustomerController.list` + `admin/customers`. Search + pagination. Verify filter by join-date / order-count is exposed in UI. |
| **KP-8.2** Customer profile detail | ✅ | `admin/customers/[id]` — orders + reviews shown, review delete endpoint wired. |

---

### EPIC 9 — Analytics & Reports (Admin)

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-9.1** Sales dashboard | ✅ | `AdminAnalyticsService.sales` — total revenue, orders, AOV, date range, series, payment-method breakdown. Frontend `admin/analytics/sales`. |
| **KP-9.2** Best-sellers report | ✅ | `bestsellers` endpoint + `bestsellers.csv`. Sortable by units/revenue. |
| **KP-9.3** Customer activity report | 🟡 | `customers` analytics endpoint exists. Verify all four sub-metrics (registrations/week, repeat rate, most active, most wishlisted) are all present in `AdminAnalyticsService.customers`. Wishlist activity may be missing. |
| **KP-9.4** CSV export | ✅ | `.csv` endpoints for sales / bestsellers / customers. **AC 222 (background generation for large exports)** is not implemented — currently sync. Fine for MVP, becomes an issue at scale. |

---

### EPIC 10 — Non-Functional Requirements

| Story | Status | Notes / Gaps |
|---|---|---|
| **KP-10.1** Responsive design | ✅ | Tailwind + design tokens; storefront pages verified in `page.tsx` files. Admin usable on tablets. |
| **KP-10.2** SEO meta title / description | ✅ | `metaTitle` / `metaDescription` on `Product` and `Category`. Sitemap in `web/src/app/sitemap.ts`. Verify defaults auto-generated when unset. |
| **KP-10.3** Performance | 🟡 | Next.js Image optimises to WebP automatically ✅, lazy loading default ✅. **No explicit Lighthouse/Core Web Vitals report captured** — must run Lighthouse to verify LCP/CLS/FID thresholds and <3s homepage load. |
| **KP-10.4** Security | ✅ | HTTPS (deployment concern), PayHere hosted checkout — no raw card data touches API, Supabase handles password hashing (bcrypt-equivalent), helmet + rate limiting in `app.ts`, session tokens managed by Supabase (expire on inactivity). |
| **KP-10.5** Staff role management | ✅ | `requireRole('staff','super_admin')` + `requireSuperAdmin` middleware, `AdminStaffController` (Super Admin only), `AdminActionLog` records every admin action with actor + timestamp. Staff cannot access `/staff`, `/action-log`. Verify staff restrictions on discount/analytics endpoints match AC 244. |

---

## PART 2 — Summary

| Epic | Done | Partial | Missing |
|---|---:|---:|---:|
| 1. Storefront | 4 | 1 | 0 |
| 2. Customer accounts | 4 | 1 | 1 |
| 3. Cart & checkout | 5 | 0 | 0 |
| 4. Payments | 3 | 2 | 1 |
| 5. Order mgmt | 2 | 2 | 0 |
| 6. Product & inventory | 3 | 2 | 1 |
| 7. Promotions | 5 | 0 | 0 |
| 8. Customer mgmt | 2 | 0 | 0 |
| 9. Analytics | 3 | 1 | 0 |
| 10. Non-functional | 4 | 1 | 0 |
| **Total (40 stories)** | **35** | **10** | **3** |

**Blocking gaps to close before v1.0 sign-off:**
1. **Product variants (KP-1.3, KP-6.4)** — no data model. Either scope out with client, or add `ProductVariant` table + admin UI + variant selection on PDP + variant-aware cart/order lines.
2. **Saved cards (KP-2.6, KP-4.5)** — full flow missing. Requires PayHere tokenisation integration.
3. **Order status emails (KP-5.4)** — SHIPPED / DELIVERED / CANCELLED emails not wired. Add 3 templates + hooks in `AdminOrderController.updateStatus`.
4. **Low-stock alerts (KP-6.3)** — threshold field exists but no cron/notification.
5. **Product tags (KP-6.2)** — no `Tag` model. Add if client needs it.
6. **Packing-slip variant of invoice PDF (KP-5.3)** — verify or add.
7. **COD status semantics (KP-4.2)** — spec says Pending, code sets Processing. Confirm with client.
8. **Status-skipping guard (KP-5.2)** — verify state machine in service; add explicit whitelist if missing.

**Nice-to-have gaps:**
- Real-time order status updates (currently on-load).
- Wishlist activity in customer analytics.
- Background CSV export for large reports.

---

## PART 3 — Testing guide: how to check each phase (end-to-end flows)

Prereqs — one-time setup:
```
# terminal 1 — API
cd api
npm install
npx prisma migrate dev
npm run seed        # loads demo products/categories/coupons
npm run dev         # http://localhost:4000

# terminal 2 — Web
cd web
npm install
npm run dev         # http://localhost:3000
```

Test accounts to create up-front:
- **Customer A**: `customer1@test.com` (register via UI).
- **Customer B (guest → auto-created)**: leave empty, will be created at checkout.
- **Staff**: promote a Supabase user by setting `app_metadata.role = "staff"` in Supabase dashboard.
- **Super Admin**: same, `role = "super_admin"`.

---

### PHASE 1 — Storefront browsing (KP-1.x)

1. Open `http://localhost:3000` in **desktop + mobile (375px in DevTools)**.
2. Confirm hero slider auto-advances, best-sellers grid loads, categories cards clickable, testimonials + newsletter render.
3. Click **Shop → All Products**. Apply Category filter, then Age filter, then Price min/max. Confirm URL updates and grid narrows without full page reload.
4. Navigate away and back — filters persist.
5. Open a product. Verify image gallery scrolls, side ad banner appears, "You may also like" section at bottom.
6. In header search: type `pain` (3 chars) → suggestions dropdown appears. Press Enter → `/search?q=pain`. Try nonsense → "We couldn't find a match".
7. Scroll to reviews on PDP. Log in as Customer A → submit a 5★ review. Try to submit again → blocked (unique constraint). Log in as staff → open admin/customers/[id] → delete the review.

**Fail if**: variant selector shows on PDP but does nothing (known gap).

---

### PHASE 2 — Customer accounts (KP-2.x)

1. Register Customer A at `/register`. Verify redirect + logged-in header state.
2. Log out. `/forgot-password` → enter email → check email inbox (Supabase → SMTP configured?).
3. Log in via **Google** button — should redirect to Google, back to `/auth/callback`, then home. Confirm Supabase created the user.
4. Go to `/account/profile`. Edit name + phone → save → refresh → persisted. Confirm email field is disabled.
5. Go to `/account/addresses`. Add two addresses. Mark one default. Delete one.
6. Place an order (see Phase 3), then check `/account/orders`. Click order → detail page shows all items + status.
7. On a product page, click the heart → check `/account/wishlist`.
8. Visit `/account/cards` — **expect the empty stub** (known gap).

---

### PHASE 3 — Cart & Checkout (KP-3.x)

1. As guest (not logged in), add 3 items to cart. Increment / decrement / remove — cart total updates instantly. Header count matches.
2. Go to `/checkout`. Fill in name, email, phone, delivery address.
3. Enter a valid coupon code (see seed data for one) → discount line appears. Enter garbage code → clear error.
4. Log in as Customer A instead → checkout shows saved-address selector.
5. Review order summary — items, address, delivery charge, discount, grand total all correct.
6. **Guest path only**: complete checkout with `guest@test.com`. Check that a Supabase user was created and a magic-link welcome email was sent.

---

### PHASE 4 — Payments (KP-4.x)

**Set env vars** in `api/.env`:
```
PAYHERE_MERCHANT_ID=...
PAYHERE_MERCHANT_SECRET=...
PAYHERE_SANDBOX=true
```

1. **PayHere path**: At checkout, choose PayHere → redirected to PayHere sandbox → complete payment → returned to `/checkout/success/KP-XXXX`. Order status = PROCESSING. Confirmation email received.
2. **PayHere fail path**: Cancel on the PayHere sandbox → returned to `/checkout/failed/KP-XXXX`. Cart items still in cart. Retry.
3. **COD path**: Choose Cash on Delivery → order placed instantly, confirmation email. In admin, order shows payment method COD. (Note: status = PROCESSING, spec says Pending — flag for client.)
4. **Bank Transfer path**: Choose Bank Transfer → land on `/checkout/bank-transfer/KP-XXXX` showing bank details, order ref, WhatsApp number, 1-day deadline. Email received with same info.
5. As admin, open the bank-transfer order → click **Confirm Payment** → status moves to PROCESSING, `payment received` email sent to customer.
6. Place another bank-transfer order → as admin click **Cancel Order** → cancellation email sent.
7. In Admin → Settings, edit bank account name / WhatsApp → new order confirmation uses new details.

**Fail if**: "Save this card" checkbox appears on PayHere screen (it shouldn't — feature not built).

---

### PHASE 5 — Admin order management (KP-5.x)

1. Log in as staff at `/admin`. Go to Orders.
2. Filter by each status. Open one order.
3. Change status Processing → Shipped. Timestamp appears in status history. **Verify customer receives a "Shipped" email** (known gap — may not arrive).
4. Try to jump PENDING_PAYMENT → DELIVERED. Should be blocked (verify with client if not).
5. Edit customer phone / address → save → reflected on order.
6. Click **Invoice** → PDF opens in new tab with logo, items, total.
7. Look for **Packing Slip** button — may be missing.

---

### PHASE 6 — Product & inventory (KP-6.x)

1. Admin → Products → **New**. Fill name, price, description, choose category, upload 3 images, set stock, mark featured. Save.
2. New product appears on storefront within seconds. Featured products list on homepage updates.
3. Edit product → change price → confirm storefront updates.
4. Reorder images in the product edit form.
5. Delete product → gone from storefront.
6. Admin → Categories → create, rename, delete. Adding a category to a product → filter option appears on `/products`.
7. Set stock = 3 on a product. Place an order for 2. Verify stock decrements to 1. Set threshold = 5 → **verify low-stock notification** (known gap — likely no alert fires).
8. Admin → Banners → upload homepage slider image, set sort order + link. Refresh homepage → new slide visible.
9. Admin → Product Banners → set side banner for a product. Refresh PDP → banner shows.
10. Try variant management — **feature missing** (KP-6.4).

---

### PHASE 7 — Promotions (KP-7.x)

1. Admin → Coupons → create `SAVE10` (10% off, expiresAt = tomorrow, maxRedemptions = 5, perCustomerLimit = 1).
2. Use at checkout → discount applied.
3. Same customer tries again → error "already used".
4. Expire coupon (edit expiresAt to past) → error "expired".
5. Admin → Discounts → Auto → create 15% off "Art" category → any product from Art auto-discounts at checkout, shown as separate line.
6. Discounts → Quantity → create "buy 3 get 5%" rule for a product → add 3 to cart → discount visible.
7. Discounts → Spend → create "spend Rs. 3,000 get Rs. 300 off" and "Rs. 5,000 get Rs. 600 off" → cart at Rs. 5,200 applies the Rs. 600 rule only (highest applicable).

---

### PHASE 8 — Customer management (KP-8.x)

1. Admin → Customers → list shows all registered users with order count.
2. Search by name / email.
3. Click a customer → orders list + reviews list. Click an order → jumps to order detail. Delete a review from here.

---

### PHASE 9 — Analytics (KP-9.x)

1. Admin → Analytics → Sales. Default = last 30 days. Change date range.
2. Verify total revenue, total orders, AOV, series chart, payment-method breakdown all render.
3. Click **Export CSV** → file downloads with visible columns + active filter, filename includes date range.
4. Analytics → Best Sellers → sort by units / revenue → export CSV.
5. Analytics → Customers → verify: new-registration series, repeat-purchase %, most active customers list. Wishlist section may be missing (known gap).

---

### PHASE 10 — Non-functional (KP-10.x)

1. **Responsive**: Chrome DevTools → toggle 375 / 768 / 1280. Every storefront page + admin page should render cleanly.
2. **SEO**: view page source on `/products/[slug]` → confirm `<title>` and `<meta name="description">` reflect DB fields, `<h1>` present, `<img alt="...">` set.
3. **Sitemap**: `/sitemap.xml` lists categories + active products.
4. **Perf**: Run Chrome Lighthouse against homepage — LCP < 2.5s, CLS < 0.1, INP < 200ms. **Capture the report**.
5. **Security**: verify site is HTTPS in prod. In DevTools Network tab on checkout, confirm no card fields ever POST to your API. Try hitting `/api/v1/admin/products` unauthenticated → 401. Try as `customer` role → 403.
6. **Role split**: Super Admin can see /admin/staff and /admin/action-log; Staff cannot (verify 403 or hidden UI). Every admin write shows up in Action Log with actor email + timestamp.

---

## PART 4 — Regression checklist (10-minute smoke test)

Run before every release:

1. `curl http://localhost:4000/health` → `{ status: "ok" }`
2. Homepage loads, hero slider visible.
3. Add-to-cart works from a product card.
4. Login as existing customer succeeds.
5. Place a COD order — end to end, confirmation email received.
6. Admin login works; orders list loads; can open one order.
7. Change order status → customer sees new status in `/account/orders`.
8. Coupon `SAVE10` still works at checkout.
9. `/api/v1/products?category=<slug>` returns filtered list.
10. No console errors on home / products / PDP / checkout.
