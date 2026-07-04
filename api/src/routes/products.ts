import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { validateQuery } from '../middleware/validate';
import { productListQuerySchema } from '../types/productQuery';

export const productRouter = Router();
const controller = new ProductController();

productRouter.get('/', validateQuery(productListQuerySchema), controller.getAll);
