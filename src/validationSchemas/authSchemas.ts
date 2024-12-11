import { z } from 'zod';

export const sendCodeSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const verifyCodeSchema = z
  .object({
    email: z.string().email(),
    code: z.string(),
    name: z.string(),
  })
  .strict();

export type SendCodeSchema = z.infer<typeof sendCodeSchema>;
export type VerifyCodeSchema = z.infer<typeof verifyCodeSchema>;
