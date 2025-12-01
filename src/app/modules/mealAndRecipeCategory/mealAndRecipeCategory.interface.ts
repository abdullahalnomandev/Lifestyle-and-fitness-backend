import { Model } from 'mongoose';
export type IMealAndRecipeCategory = {
  title: string;
  active:boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MealAndRecipeCategoryModel = Model<IMealAndRecipeCategory>;
