import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { BookingClassRoutes } from '../app/modules/bookingClass/booking.route';
import { ClassRoutes } from '../app/modules/class/class.route';
import { ClubRoutes } from '../app/modules/club/club.route';
import { CommentRoutes } from '../app/modules/post/comment/comment.route';
import { LikeRoutes } from '../app/modules/post/like';
import { PostRoutes } from '../app/modules/post/post.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { StripeRoutes } from '../app/modules/stripe/stripe.route';
import { ConversationRoutes } from '../app/modules/conversation/conversation.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
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
    path: '/club',
    route: ClubRoutes,
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
    path: '/class',
    route: ClassRoutes,
  },
  {
    path: '/book-class-attandence',
    route: BookingClassRoutes,
  },
  {
    path: '/stripe',
    route: StripeRoutes,
  },
  {
    path: '/conversation',
    route: ConversationRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes
  },
  {
    path: '/notification',
    route: NotificationRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
