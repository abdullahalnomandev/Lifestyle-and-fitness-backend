import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { NetworkConnectionController } from './networkConnetion.controller';
import { NetworkConnectionValidation } from './networkConnetion.validation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.createZodSchema),
    NetworkConnectionController.sendRequest
  )
  .get(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NetworkConnectionController.getAll
  );

router
  .route('/cancel')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.createZodSchema),
    NetworkConnectionController.cancelRequest
  );

router
  .route('/user/:userId')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.updateZodSchema),
    NetworkConnectionController.getUserAllNetworks
  );
  
router
  .route('/disconnect/:id')
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.updateZodSchema),
    NetworkConnectionController.disconnect
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NetworkConnectionController.getById
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.updateZodSchema),
    NetworkConnectionController.updateStatus
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NetworkConnectionController.remove
  );

export const NetworkConnectionRoutes = router;