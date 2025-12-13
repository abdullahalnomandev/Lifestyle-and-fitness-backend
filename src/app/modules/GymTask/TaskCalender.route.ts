import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { TaskCalenderController } from './TaskCalender.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    TaskCalenderController.createTaskCalender
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    TaskCalenderController.getAllTaskCalenders
  );

router.post('/upload-workout-picture',
  fileUploadHandler(),
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
  TaskCalenderController.uploadWorkoutPicture
);

router.get('/workout-progress',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
  TaskCalenderController.getWorkoutProgress
);


export const TaskCalenderRoutes = router;

