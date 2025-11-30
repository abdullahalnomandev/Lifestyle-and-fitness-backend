import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { PreferenceRoutes } from '../app/modules/preference/preferences.route';
import { PostRoutes } from '../app/modules/post/post.route';
import { CommentRoutes } from '../app/modules/post/comment/comment.route';
import { LikeRoutes } from '../app/modules/post/like';
import { SaveRoutes } from '../app/modules/post/save';
import { StoryRoutes } from '../app/modules/story/story.route';
import { NetworkConnectionRoutes } from '../app/modules/networkConnetion/networkConnetion.route';
import { BusinessAndMindsetPlanRoutes } from '../app/modules/businessAndMindsetPlan/businessAndMindsetPlan.route';

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
    path: '/network-connection',
    route: NetworkConnectionRoutes,
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
    path: '/post/save',
    route: SaveRoutes,
  },
  {
    path: '/story',
    route: StoryRoutes,
  },
  {
    path: '/business-and-mindset-plan',
    route: BusinessAndMindsetPlanRoutes,
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
