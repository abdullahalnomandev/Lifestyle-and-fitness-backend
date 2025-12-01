import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { GymAndFitnessPlanController } from './GymAndFitnessPlan.controller';
import { GymAndFitnessPlanValidation } from './GymAndFitnessPlan.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  GymAndFitnessPlanController.createGymAndFitnessPlan
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  GymAndFitnessPlanController.getSingleGymAndFitnessPlan
);
router.patch(
  '/:id',
  validateRequest(GymAndFitnessPlanValidation.updateGymAndFitnessPlanZodSchema),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  GymAndFitnessPlanController.updateGymAndFitnessPlan
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  GymAndFitnessPlanController.deleteGymAndFitnessPlan
);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  GymAndFitnessPlanController.getAllGymAndFitnessPlans
);

export const GymAndFitnessPlanRoutes = router;
