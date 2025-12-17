import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { FavouriteController } from './favourite.controller';

const router = express.Router();

router.post(
  '/toggle/:handle',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  FavouriteController.toggleFavourite
);

router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  FavouriteController.getUserFavourites
);

router.get(
  '/:handle/status',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  FavouriteController.getUserFavouriteStatus
);

export const FavouriteRoutes = router;

