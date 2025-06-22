import { z } from 'zod';

// Helper regex for longitude,latitude
const coordinateRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

export const directionsSchema = z.object({
	points: z.string().refine(
		(val) => {
			const parts = val.split(';');
			return parts.length >= 2 && parts.length <= 25 && parts.every((coord) => coordinateRegex.test(coord.trim()));
		},
		{
			message: 'Coordinates must be a semicolon-separated list of 2–25 "longitude,latitude" pairs',
		}
	),

	language: z
		.string()
		.optional()
		.refine((val) => !val || /^[a-z]{2}(-[A-Z]{2})?$/.test(val), {
			message: 'Language must be a valid language code like "en" or "en-US"',
		}),
});
