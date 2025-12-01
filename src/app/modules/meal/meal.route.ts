import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { MealController } from './meal.controller';
import { MealValidation } from './meal.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  MealController.createMeal
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealController.getSingleMeal
);
router.patch(
  '/:id',
  validateRequest(MealValidation.updateMealZodSchema),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  MealController.updateMeal
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealController.deleteMeal
);
router.get(
  '/all/:categoryId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealController.getAllMeals
);

export const MealRoutes = router;
