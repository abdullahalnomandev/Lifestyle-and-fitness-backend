import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    validateRequest(UserValidation.updateUserZodSchema),
    UserController.updateProfile
  );

router
  .route('/')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.getAllUsers)
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );

router
  .route('/profile/user/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.getUserProfileById
  );

router
  .route('/profile/activity/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.getUserActivity
  );


router
  .route('/unfollow/:id')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.unfollowUser
  );


router
  .route('')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.toggleProfileUpdate
  );

router
  .route('/status/toggle-profile-status/:id')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.toggleProfileUpdate
  );


router
  .route('/user-statistics')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.UserStatistics
  );
router
  .route('/user-earning')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.UserEarningStatistics
  );



export const UserRoutes = router;
