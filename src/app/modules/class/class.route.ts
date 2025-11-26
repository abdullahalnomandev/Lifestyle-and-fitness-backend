import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { ClassController } from './class.controller';

const router = express.Router();

router
    .route('/')
    .post(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        ClassController.createClass
    )

router
    .route('/:club_id')
    .get(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        ClassController.getClassesByClubId
    )

router
    .route('/class-schedule-details/:class_id/:class_start_date')
    .get(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        ClassController.getClassSchedule
    )
router
    .route('/:id')
    .delete(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        ClassController.deleteClass
    )

router
    .route('/update/:club_id/:class_id')
    .patch
    (
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        ClassController.updateClass
    )

router
    .route('/update/status')
    .patch
    (
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        ClassController.updateStatus
    )




export const ClassRoutes = router;