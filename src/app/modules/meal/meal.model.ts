import { Schema, model } from 'mongoose';
import { IMeal, MealAndRecipeCategoryModel } from './meal.interface';

const MealSchema = new Schema<IMeal, MealAndRecipeCategoryModel>(
  {
    mealCategory: {
      type: Schema.Types.ObjectId,
      ref: 'MealAndRecipeCategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Meal = model<IMeal, MealAndRecipeCategoryModel>(
  'Meal',
  MealSchema
);
