import { z } from 'zod';

export const redisUserTripDataSchema = z.object({
	name: z.string({ message: 'Name must be a string' }),
});
