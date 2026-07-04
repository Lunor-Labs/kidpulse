import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { allowedOrigins } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { categoryRouter } from './routes/categories';
import { productRouter } from './routes/products';

export const app = express();

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);
