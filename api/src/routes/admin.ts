import { Router, json } from 'express';
import { authenticate, requireRole, requireSuperAdmin } from '../middleware/auth';
import { adminActionLog } from '../middleware/adminActionLog';
import { validateBody } from '../middleware/validate';
import { AdminActionLogController } from '../controllers/AdminActionLogController';
import { AdminAnalyticsController } from '../controllers/AdminAnalyticsController';
import { AdminCategoryController } from '../controllers/AdminCategoryController';
import { AdminCouponController } from '../controllers/AdminCouponController';
import { AdminCustomerController } from '../controllers/AdminCustomerController';
import { AdminDiscountController } from '../controllers/AdminDiscountController';
import { AdminOrderController } from '../controllers/AdminOrderController';
import { AdminProductController } from '../controllers/AdminProductController';
import { AdminSettingsController } from '../controllers/AdminSettingsController';
import { AdminStaffController } from '../controllers/AdminStaffController';
import { HomeBannerController } from '../controllers/HomeBannerController';
import { ProductBannerController } from '../controllers/ProductBannerController';
import {
  adminSettingsSchema,
  autoDiscountUpsertSchema,
  bankPaymentActionSchema,
  bannerUpsertSchema,
  categoryUpsertSchema,
  couponUpsertSchema,
  imageUploadSchema,
  orderShippingUpdateSchema,
  orderStatusUpdateSchema,
  productBannerUpsertSchema,
  productUpsertSchema,
  quantityDiscountUpsertSchema,
  reviewModerationSchema,
  spendThresholdUpsertSchema,
  staffCreateSchema,
  staffUpdateSchema,
} from '../types/adminSchemas';

export const adminRouter = Router();

const categories = new AdminCategoryController();
const products = new AdminProductController();
const banners = new HomeBannerController();
const productBanners = new ProductBannerController();
const settings = new AdminSettingsController();
const orders = new AdminOrderController();
const coupons = new AdminCouponController();
const discounts = new AdminDiscountController();
const customers = new AdminCustomerController();
const analytics = new AdminAnalyticsController();
const staff = new AdminStaffController();
const actionLog = new AdminActionLogController();

adminRouter.use(authenticate, requireRole('staff', 'super_admin'), adminActionLog);

adminRouter.get('/dashboard', products.dashboard);

adminRouter.get('/categories', categories.list);
adminRouter.get('/categories/:id', categories.get);
adminRouter.post('/categories', validateBody(categoryUpsertSchema), categories.create);
adminRouter.put('/categories/:id', validateBody(categoryUpsertSchema), categories.update);
adminRouter.delete('/categories/:id', categories.remove);

adminRouter.get('/banners', banners.listAdmin);
adminRouter.get('/banners/:id', banners.getAdmin);
adminRouter.post('/banners', validateBody(bannerUpsertSchema), banners.create);
adminRouter.put('/banners/:id', validateBody(bannerUpsertSchema), banners.update);
adminRouter.delete('/banners/:id', banners.remove);

adminRouter.get('/product-banners', productBanners.listAdmin);
adminRouter.get('/product-banners/:id', productBanners.getAdmin);
adminRouter.post(
  '/product-banners',
  validateBody(productBannerUpsertSchema),
  productBanners.create
);
adminRouter.put(
  '/product-banners/:id',
  validateBody(productBannerUpsertSchema),
  productBanners.update
);
adminRouter.delete('/product-banners/:id', productBanners.remove);

adminRouter.get('/products', products.list);
adminRouter.get('/products/:id', products.get);
adminRouter.post('/products', validateBody(productUpsertSchema), products.create);
adminRouter.put('/products/:id', validateBody(productUpsertSchema), products.update);
adminRouter.delete('/products/:id', products.remove);

adminRouter.get('/orders', orders.list);
adminRouter.get('/orders/:orderNumber', orders.get);
adminRouter.get('/orders/:orderNumber/invoice.pdf', orders.invoice);
adminRouter.get('/orders/:orderNumber/packing-slip.pdf', orders.packingSlip);
adminRouter.put(
  '/orders/:id/status',
  validateBody(orderStatusUpdateSchema),
  orders.updateStatus
);
adminRouter.put(
  '/orders/:id/shipping',
  validateBody(orderShippingUpdateSchema),
  orders.updateShipping
);
adminRouter.post('/orders/:id/payments/bank-confirm', orders.bankConfirm);
adminRouter.post(
  '/orders/:id/payments/bank-cancel',
  validateBody(bankPaymentActionSchema),
  orders.bankCancel
);

adminRouter.get('/coupons', coupons.list);
adminRouter.get('/coupons/:id', coupons.get);
adminRouter.post('/coupons', validateBody(couponUpsertSchema), coupons.create);
adminRouter.put('/coupons/:id', validateBody(couponUpsertSchema), coupons.update);
adminRouter.delete('/coupons/:id', coupons.remove);

adminRouter.get('/discounts/auto', discounts.listAuto);
adminRouter.post(
  '/discounts/auto',
  validateBody(autoDiscountUpsertSchema),
  discounts.createAuto
);
adminRouter.put(
  '/discounts/auto/:id',
  validateBody(autoDiscountUpsertSchema),
  discounts.updateAuto
);
adminRouter.delete('/discounts/auto/:id', discounts.removeAuto);

adminRouter.get('/discounts/quantity', discounts.listQuantity);
adminRouter.post(
  '/discounts/quantity',
  validateBody(quantityDiscountUpsertSchema),
  discounts.createQuantity
);
adminRouter.put(
  '/discounts/quantity/:id',
  validateBody(quantityDiscountUpsertSchema),
  discounts.updateQuantity
);
adminRouter.delete('/discounts/quantity/:id', discounts.removeQuantity);

adminRouter.get('/discounts/spend', discounts.listSpend);
adminRouter.post(
  '/discounts/spend',
  validateBody(spendThresholdUpsertSchema),
  discounts.createSpend
);
adminRouter.put(
  '/discounts/spend/:id',
  validateBody(spendThresholdUpsertSchema),
  discounts.updateSpend
);
adminRouter.delete('/discounts/spend/:id', discounts.removeSpend);

adminRouter.get('/customers', customers.list);
adminRouter.get('/customers/:id', customers.get);
adminRouter.delete('/reviews/:reviewId', customers.deleteReview);
adminRouter.patch(
  '/reviews/:reviewId',
  validateBody(reviewModerationSchema),
  customers.moderateReview
);

adminRouter.get('/analytics/sales', analytics.sales);
adminRouter.get('/analytics/sales.csv', analytics.salesCsv);
adminRouter.get('/analytics/bestsellers', analytics.bestSellers);
adminRouter.get('/analytics/bestsellers.csv', analytics.bestSellersCsv);
adminRouter.get('/analytics/customers', analytics.customers);
adminRouter.get('/analytics/customers.csv', analytics.customersCsv);

adminRouter.get('/settings', settings.get);
adminRouter.put('/settings', validateBody(adminSettingsSchema), settings.update);

adminRouter.get('/staff', requireSuperAdmin, staff.list);
adminRouter.post(
  '/staff',
  requireSuperAdmin,
  validateBody(staffCreateSchema),
  staff.create
);
adminRouter.put(
  '/staff/:id',
  requireSuperAdmin,
  validateBody(staffUpdateSchema),
  staff.update
);
adminRouter.delete('/staff/:id', requireSuperAdmin, staff.remove);

adminRouter.get('/action-log', requireSuperAdmin, actionLog.list);

adminRouter.post(
  '/uploads/image',
  json({ limit: '8mb' }),
  validateBody(imageUploadSchema),
  products.uploadImage
);
