import { z } from 'zod';
import { TripStatusArray } from 'trip-track-package';

const STR_MIN = 2;
const STR_MAX = 100;

export const tripUpdateStatusSchema = z.object({ status: z.enum(TripStatusArray) });

export const updateRewardSchema = z.object({
	title: z
		.string()
		.min(STR_MIN, {
			message: 'Reward title must be at least 2 characters long.',
		})
		.max(STR_MAX, {
			message: `Reward title must not exceed ${STR_MAX} characters.`,
		}),
	image: z
		.instanceof(File, { message: 'Reward image is required.' })
		.refine((file) => file.size <= 5 * 1024 * 1024, {
			message: 'Image file size must not exceed 5MB.',
		})
		.refine(
			(file) => file && ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif'].includes(file.type),
			{
				message: 'Invalid image file type. Supported formats: PNG, JPEG, JPG, SVG, GIF.',
			}
		)
		.optional(),
});
