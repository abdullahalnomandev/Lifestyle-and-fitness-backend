import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { LikeController } from './like.controller';

const router = express.Router();

// Toggle like (like/unlike) - requires authentication
router.post(
  '/toggle/:postId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  LikeController.toggleLike
);

router.get('/:postId', LikeController.getPostLikes);

router.get(
  '/:postId/status',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  LikeController.getUserLikeStatus
);

export const LikeRoutes = router;
