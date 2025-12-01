import { z } from 'zod';

const createGymAndFitnessPlanZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    description: z.string({
      required_error: 'Details are required',
    }),
    image: z.string({
      required_error: 'Image is required',
    }),
  }),
});

const updateGymAndFitnessPlanZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    details: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const GymAndFitnessPlanValidation = {
  createGymAndFitnessPlanZodSchema,
  updateGymAndFitnessPlanZodSchema,
};
