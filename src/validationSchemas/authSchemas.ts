import { z } from 'zod';

export const sendCodeSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Please provide a valid email address.' }),
  })
  .strict();

export const verifyCodeSchema = z
  .object({
    code: z
      .string()
      .min(6, { message: 'Code must be exactly 6 characters' })
      .max(6, { message: 'Code must be exactly 6 characters' }),

    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(15, { message: 'Name must be at most 15 characters long' }),

    email: z
      .string()
      .email({ message: 'Please provide a valid email address.' }),
  })
  .strict();

export type SendCodeSchema = z.infer<typeof sendCodeSchema>;
export type VerifyCodeSchema = z.infer<typeof verifyCodeSchema>;
