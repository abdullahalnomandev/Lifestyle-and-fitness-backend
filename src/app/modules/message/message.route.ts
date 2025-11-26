import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { MessageController } from './message.controller';
import { MessageValidation } from './message.validation';

const router = express.Router();

router
    .route('/')
    .post(
        auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
        fileUploadHandler(),
        MessageController.sendMessage

    );


router.route('/:id')
    .get(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        MessageController.getAllMessages
    );

export const MessageRoutes = router;