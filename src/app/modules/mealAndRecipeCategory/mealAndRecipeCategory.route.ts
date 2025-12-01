import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MealAndRecipeCategoryController } from './mealAndRecipeCategory.controller';
import { MealAndRecipeCategoryValidation } from './mealAndRecipeCategory.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(
    MealAndRecipeCategoryValidation.createMealAndRecipeCategoryZodSchema
  ),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealAndRecipeCategoryController.createMealAndRecipeCategory
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealAndRecipeCategoryController.getSingleMealAndRecipeCategory
);
router.patch(
  '/:id',
  validateRequest(
    MealAndRecipeCategoryValidation.updateMealAndRecipeCategoryZodSchema
  ),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealAndRecipeCategoryController.updateMealAndRecipeCategory
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealAndRecipeCategoryController.deleteMealAndRecipeCategory
);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MealAndRecipeCategoryController.getAllMealAndRecipeCategory
);

export const MealAndRecipeCategoryRoutes = router;
