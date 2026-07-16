import { Router } from 'express';
import { HomeBannerController } from '../controllers/HomeBannerController';

export const bannerRouter = Router();
const controller = new HomeBannerController();

bannerRouter.get('/', controller.listPublic);
