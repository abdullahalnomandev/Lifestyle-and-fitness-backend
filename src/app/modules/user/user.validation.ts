import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format').optional(),
    mobile: z.string().optional(),
    confirm_password: z.string().optional(),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
    status: z.enum(['active', 'delete']).optional(),
    verified: z.boolean().optional(),
    profileImage: z.string().optional(),
    token: z.string().optional(),
    authorization: z.object({
      oneTimeCode: z.string(),
      expireAt: z.coerce.date(),
    }).optional(),
    google_id_token: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    mobile: z.string().optional(),
    confirm_password: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']).optional(),
    status: z.enum(['active', 'delete']).optional(),
    verified: z.boolean().optional(),
    profileImage: z.string().optional(),
    token: z.string().optional(),
    authorization: z.object({
      oneTimeCode: z.string(),
      expireAt: z.coerce.date(),
    }).optional(),
    google_id_token: z.string().optional(),
    auth_provider: z.enum(['LOCAL', 'GOOGLE']).optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
