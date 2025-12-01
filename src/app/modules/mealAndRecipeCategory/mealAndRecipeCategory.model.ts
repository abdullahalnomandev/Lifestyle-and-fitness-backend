import { Schema, model } from 'mongoose';
import {
  IMealAndRecipeCategory,
  MealAndRecipeCategoryModel,
} from './mealAndRecipeCategory.interface';

const MealAndRecipeCategorySchema = new Schema<
  IMealAndRecipeCategory,
  MealAndRecipeCategoryModel
>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MealAndRecipeCategory = model<
  IMealAndRecipeCategory,
  MealAndRecipeCategoryModel
>('MealAndRecipeCategory', MealAndRecipeCategorySchema);
