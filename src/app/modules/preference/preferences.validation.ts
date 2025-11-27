import { z } from 'zod';

const createZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional(),
    active: z.boolean().optional(),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
  }),
});

export const PreferenceValidation = {
  createZodSchema,
  updateZodSchema,
};

