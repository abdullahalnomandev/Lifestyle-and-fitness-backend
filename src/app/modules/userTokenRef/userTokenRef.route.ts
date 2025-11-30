import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserTokenRefController } from './userTokenRef.controller';
import { UserTokenRefValidation } from './userTokenRef.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(UserTokenRefValidation.createUserTokenRef),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  UserTokenRefController.createUserTokenRef
);

router.get(
  '/:ref',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  UserTokenRefController.getSingleUserTokenRef
);

router.patch(
  '/:ref',
  validateRequest(UserTokenRefValidation.updateUserTokenRef),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserTokenRefController.updateUserTokenRef
);

router.delete(
  '/:ref',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserTokenRefController.deleteUserTokenRef
);

export const UserTokenRefRoutes = router;
