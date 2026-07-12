import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { ProfileController } from '../controllers/ProfileController';
import { AddressController } from '../controllers/AddressController';
import { WishlistController } from '../controllers/WishlistController';
import { ReviewController } from '../controllers/ReviewController';
import { OrderController } from '../controllers/OrderController';
import {
  addressSchema,
  profileUpdateSchema,
  reviewSubmitSchema,
  wishlistToggleSchema,
} from '../types/accountSchemas';

export const accountRouter = Router();

const profile = new ProfileController();
const addresses = new AddressController();
const wishlist = new WishlistController();
const reviews = new ReviewController();
const orders = new OrderController();

accountRouter.use(authenticate);

accountRouter.get('/profile', profile.me);
accountRouter.put('/profile', validateBody(profileUpdateSchema), profile.update);

accountRouter.get('/addresses', addresses.list);
accountRouter.post('/addresses', validateBody(addressSchema), addresses.create);
accountRouter.put('/addresses/:id', validateBody(addressSchema), addresses.update);
accountRouter.delete('/addresses/:id', addresses.remove);

accountRouter.get('/wishlist', wishlist.list);
accountRouter.get('/wishlist/ids', wishlist.ids);
accountRouter.post('/wishlist/toggle', validateBody(wishlistToggleSchema), wishlist.toggle);

accountRouter.post(
  '/reviews/:productId',
  validateBody(reviewSubmitSchema),
  reviews.submit
);

accountRouter.get('/orders', orders.list);
accountRouter.get('/orders/:orderNumber', orders.getByNumber);
