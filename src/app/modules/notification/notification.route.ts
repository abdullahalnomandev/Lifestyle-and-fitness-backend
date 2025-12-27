import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controller';

const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    NotificationController.getMyNotifications
  );

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    NotificationController.markAsSeen
  );

router
  .route('/count')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    NotificationController.notificationUnreadCount
  );

router
  .route('/update')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    NotificationController.updateNotificationCount
  );



export const NotificationRoutes = router;
