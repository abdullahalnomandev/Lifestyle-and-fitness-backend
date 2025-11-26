import { z } from 'zod';

const createMessageZodSchema = z.object({
  image: z.string({ required_error: 'Image is required' }),
  receiver: z.string({ required_error: 'Receiver is required' }),
  text: z.string().optional(),
  conversation: z.string().optional(),
});

export const MessageValidation = {
  createMessageZodSchema,
};