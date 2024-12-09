import { z } from 'zod';

export const sendCodeSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string(),
});
