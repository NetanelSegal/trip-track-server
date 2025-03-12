import { Schemas } from 'trip-track-package';
import { z } from 'zod';

export const socketDataSchema = {
	joinTrip: Schemas.mongoObjectId,
	updateLocation: [
		Schemas.mongoObjectId,
		z.object({
			lon: z.number({ message: 'lon must be a number' }),
			lat: z.number({ message: 'lat must be a number' }),
		}),
	],
	finishExperience: Schemas.mongoObjectId,
	sendMessage: [
		Schemas.mongoObjectId,
		z
			.string({ message: 'message must be a string' })
			.max(300, 'Message must be at most 300 characters long')
			.min(1, 'Message must be at least 1 character long'),
		z.string({ message: 'userId must be a string' }),
	],
};
