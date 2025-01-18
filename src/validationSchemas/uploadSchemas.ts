import { z } from 'zod';

export const deleteImageSchema = z.object({
  filename: z
    .string()
    .min(6, 'Filename of an image must be at least 6 characters long'),
});
