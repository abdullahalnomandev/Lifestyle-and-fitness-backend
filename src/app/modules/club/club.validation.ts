import { z } from 'zod';

// Schema for creating a club
const createClubZodSchema = z.object({
  name: z.string({ required_error: 'Club name is required' }),
  description: z.string().optional(),
  website: z.string().url('Website must be a valid URL').optional(),
  address: z.string().optional(),
  club_creator: z.string({ required_error: 'Club creator is required' }),
  stablished_date: z.string().datetime().optional(),
  country: z.string().optional(),
  post_code: z.string().optional(),
  club_specilaity: z.array(z.string()).optional(),
  club_logo: z.string().url('Club logo must be a valid URL').optional(),
  club_image: z.string().url('Club image must be a valid URL').optional(),
});

// Schema for updating a club
const updateClubZodSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url('Website must be a valid URL').optional(),
  address: z.string().optional(),
  stablished_date: z.string().datetime().optional(),
  country: z.string().optional(),
  post_code: z.string().optional(),
  club_specilaity: z.array(z.string()).optional(),
  club_logo: z.string().url('Club logo must be a valid URL').optional(),
  club_image: z.string().url('Club image must be a valid URL').optional(),
});

export const ClubValidation = {
  createClubZodSchema,
  updateClubZodSchema,
};
