import { z } from 'zod';

const createMealAndRecipeCategoryZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
  }),
});

const updateMealAndRecipeCategoryZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});

export const MealAndRecipeCategoryValidation = {
  createMealAndRecipeCategoryZodSchema,
  updateMealAndRecipeCategoryZodSchema,
};
