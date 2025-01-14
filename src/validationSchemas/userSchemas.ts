import { z } from 'zod';

export const userUpdateSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(15, { message: 'Name must be at most 15 characters long' }),

    imageUrl: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(250, { message: 'Name must be at most 15 characters long' }),
  })
  .partial()
  .strict();
