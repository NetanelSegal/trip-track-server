import { z } from 'zod';

export const redisAddUserToTripSchema = z.object({
	name: z.string({
		message: 'Name is required.',
	}),
	imageUrl: z.string({
		message: 'Image URL is required.',
	}),
});
