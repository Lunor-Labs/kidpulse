import { Router } from 'express';
import { MomentsGalleryController } from '../controllers/MomentsGalleryController';

export const momentsRouter = Router();
const controller = new MomentsGalleryController();

momentsRouter.get('/', controller.listPublic);