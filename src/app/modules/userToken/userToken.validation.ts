import { z } from 'zod';

const createTokenZodSchema = z.object({
  body: z.object({
    user: z.string({
      required_error: 'User ID is required',
    }),
    numberOfToken: z.number({
      required_error: 'Number of token is required',
    }),
  }),
});

const updateTokenZodSchema = z.object({
  body: z.object({
    user: z.string().optional(),
    numberOfToken: z.number().optional(),
  }),
});

export const UserTokenValidation = {
  createTokenZodSchema,
  updateTokenZodSchema,
};
