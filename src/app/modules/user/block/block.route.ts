import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { BlockController } from './report.controller';

const router = express.Router();

// Create a block (user blocks another user)
router.post(
  '/:userId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  BlockController.createBlock
);

// Get blocks created by a specific user
router.get(
  '/user/:userId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  BlockController.getBlocksByUser
);

// Get all blocks (admin)
router.get(
  '/my-blocks',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ,USER_ROLES.USER),
  BlockController.getAllBlocks
);


// Delete a block (unblock)
router.delete(
  '/:blockId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  BlockController.deleteBlock
);

export const BlockRoutes = router;