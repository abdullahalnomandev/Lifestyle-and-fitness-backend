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
  .route('/profile/skip')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    UserController.updateSkypeProfile
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
  .route('/toggle/follow/:id')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.toggleFollowUser
  );

router
  .route('/unfollow/:id')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.unfollowUser
  );

router
  .route('/profile/follower-list/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.getFollowerList
  );

router
  .route('/profile/following-list/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.getFollowingList
  );

router
  .route('/notification-settings')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.getAllNotificationSettings
  );

router
  .route('/notification-settings')
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    UserController.updateNotificationSettings
  );


export const UserRoutes = router;
