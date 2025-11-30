import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { StoryLikeController } from './like.controller';

const router = express.Router({ mergeParams: true });

// Toggle like (like/unlike) - requires authentication
// storyId comes from parent route: /story/:storyId/likes
router.post(
  '/toggle',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  StoryLikeController.toggleLike
);

router.get('/', StoryLikeController.getStoryLikes);

router.get(
  '/status',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  StoryLikeController.getUserLikeStatus
);

export const StoryLikeRoutes = router;

