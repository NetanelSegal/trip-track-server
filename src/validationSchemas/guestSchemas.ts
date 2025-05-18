import { z } from 'zod';

export const updateGuestTokenSchema = z.object({
	name: z
		.string()
		.min(2, { message: 'Name must be at least 2 characters long' })
		.max(15, { message: 'Name must be at most 15 characters long' }),

	imageUrl: z
		.string()
		.min(2, { message: 'Image URL must be at least 2 characters long' })
		.max(250, { message: 'Image URL must be at most 250 characters long' }),
});
