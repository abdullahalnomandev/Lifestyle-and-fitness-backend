import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PreferenceController } from './preferences.controller';
import { PreferenceValidation } from './preferences.validation';



const router = express.Router();

router
    .route('/')
    .post(
        // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        // auth(USER_ROLES.USER),
        validateRequest(PreferenceValidation.createZodSchema),
        PreferenceController.create
    )
    .get(PreferenceController.getAll);

router
    .route('/:id')
    .get(PreferenceController.getById)
    .patch(
        // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        auth(USER_ROLES.USER),
        validateRequest(PreferenceValidation.updateZodSchema),
        PreferenceController.update
    )
    .delete(
        // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
        auth(USER_ROLES.USER)
        , PreferenceController.remove);

export const PreferenceRoutes = router;

