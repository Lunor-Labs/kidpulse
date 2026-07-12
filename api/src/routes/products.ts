import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { validateQuery } from '../middleware/validate';
import { productListQuerySchema, productSearchQuerySchema } from '../types/productQuery';

export const productRouter = Router();
const controller = new ProductController();

productRouter.get('/search', validateQuery(productSearchQuerySchema), controller.search);
productRouter.get('/', validateQuery(productListQuerySchema), controller.getAll);
productRouter.get('/:slug', controller.getBySlug);
productRouter.get('/:slug/reviews', controller.getReviews);
