import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ConversationController } from './conversaion.controller';


const router = express.Router();

router
  .route('/')
  .post(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.USER,
    ),
    ConversationController.createConversation
  )
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.USER,
    ),
    ConversationController.getAllConversaions
  );

  router.delete(
    '/:id',
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.USER,
    ),
    ConversationController.deleteConversation
  );

export const ConversationRoutes = router;