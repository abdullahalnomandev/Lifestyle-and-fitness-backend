import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { StoreController } from './store.controller';

const router = express.Router();

router
  .route('/collection')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER,USER_ROLES.SUPER_ADMIN), StoreController.getProductCollections);

router.get('/products/:slug', auth(USER_ROLES.ADMIN, USER_ROLES.USER,USER_ROLES.SUPER_ADMIN), StoreController.getProductsByCollectionHandle);

router.get('/product/:id', auth(USER_ROLES.ADMIN, USER_ROLES.USER,USER_ROLES.SUPER_ADMIN), StoreController.getProductById);

// router.post('/product/ceckout', auth(USER_ROLES.ADMIN, USER_ROLES.USER,USER_ROLES.SUPER_ADMIN), StoreController.createCheckoutSession);

router.post('/product/create-checkout',auth(USER_ROLES.ADMIN,USER_ROLES.USER,USER_ROLES.SUPER_ADMIN),StoreController.createCheckout)


export const StoreRoutes = router;
