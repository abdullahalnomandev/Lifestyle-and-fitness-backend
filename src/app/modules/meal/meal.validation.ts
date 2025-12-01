import { z } from 'zod';

const createMealZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Title is required',
    }),
    category: z.string({
      required_error: 'Category is required',
    }),
    ingredients: z.array(z.string()).optional(),
    instructions: z.string().optional(),
    cookingTime: z.string().optional(),
    nutritionalInfo: z.string().optional(),
  }),
});

const updateMealZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
    instructions: z.string().optional(),
    cookingTime: z.string().optional(),
    nutritionalInfo: z.string().optional(),
  }),
});

export const MealValidation = {
  createMealZodSchema,
  updateMealZodSchema,
};
