import { Router } from 'express';
import { ProductBannerController } from '../controllers/ProductBannerController';

export const productBannerRouter = Router();
const controller = new ProductBannerController();

productBannerRouter.get('/', controller.getPublic);
