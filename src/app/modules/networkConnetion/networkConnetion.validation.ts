import { z } from 'zod';
import { NETWORK_CONNECTION_STATUS_LIST } from './networkConnetion.constant';

const createZodSchema = z.object({
  body: z.object({
    requestFrom: z.string({ required_error: 'requestFrom is required' }).optional(),
    requestTo: z.string({ required_error: 'requestTo is required' }),
  }),
});

const updateZodSchema = z.object({
  body: z.object({
    status: z
      .enum([...NETWORK_CONNECTION_STATUS_LIST] as [
        string,
        ...string[]
      ])
      .optional(),
  }),
});

export const NetworkConnectionValidation = {
  createZodSchema,
  updateZodSchema,
};

