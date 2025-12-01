import mongoose from 'mongoose';
import { Model } from 'mongoose';
export type IMeal = {
  mealCategory: mongoose.ObjectId;
  name: string;
  image:string;
  description:string
  createdAt?: Date;
  updatedAt?: Date;
};

export type MealAndRecipeCategoryModel = Model<IMeal>;
