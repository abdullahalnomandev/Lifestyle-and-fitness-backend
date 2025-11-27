import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { PreferenceRoutes } from '../app/modules/preference/preferences.route';
import { PostRoutes } from '../app/modules/post/post.route';
import { CommentRoutes } from '../app/modules/post/comment/comment.route';
import { LikeRoutes } from '../app/modules/post/like';
import { NetworkConnectionRoutes } from '../app/modules/networkConnetion/networkConnetion.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/preference',
    route: PreferenceRoutes,
  },
  {
    path: '/post',
    route: PostRoutes,
  },
  {
    path: '/post/comment',
    route: CommentRoutes,
  },
  {
    path: '/post/like',
    route: LikeRoutes,
  },
  {
    path: '/network-connection',
    route: NetworkConnectionRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
