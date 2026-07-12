import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { allowedOrigins } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { accountRouter } from './routes/account';
import { adminRouter } from './routes/admin';
import { bannerRouter } from './routes/banners';
import { categoryRouter } from './routes/categories';
import { checkoutRouter } from './routes/checkout';
import { paymentsRouter } from './routes/payments';
import { productBannerRouter } from './routes/productBanners';
import { productRouter } from './routes/products';

export const app = express();

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));

const jsonParser = express.json({ limit: '10kb' });
const LARGE_BODY_PATHS = new Set<string>(['/api/v1/admin/uploads/image']);
app.use((req, res, next) => {
  if (LARGE_BODY_PATHS.has(req.path)) return next();
  return jsonParser(req, res, next);
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/banners', bannerRouter);
app.use('/api/v1/product-banners', productBannerRouter);
app.use('/api/v1/checkout', strictLimiter, checkoutRouter);
app.use('/api/v1/payments', strictLimiter, paymentsRouter);
app.use('/api/v1/account', accountRouter);
app.use('/api/v1/admin', adminLimiter, adminRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);
