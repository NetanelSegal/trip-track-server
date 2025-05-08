import fs from 'fs';
import { randomInt } from 'crypto';
import { v4 as uuidV4 } from 'uuid';
import { AppError } from '../utils/AppError';
import { Trip } from '../models/trip.model';
import { TripStatusArray } from 'trip-track-package';
export function generateRandomDigitsCode(length: number): string {
	return randomInt(10 ** (length - 1), 10 ** length - 1).toString();
}

export function generateUUID(): string {
	return uuidV4();
}

export function readFile(path: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, data) => (err ? reject(err) : resolve(data)));
	});
}

type TripStatus = (typeof TripStatusArray)[number];

type TripNotFoundArgs = {
	tripId: string;
	userId: string;
	action: string;
	notAllowedStatuses: TripStatus[];
};

export async function handleWhyTripNotFoundMongo({ tripId, userId, action, notAllowedStatuses }: TripNotFoundArgs) {
	const trip = await Trip.findById(tripId);
	if (!trip) {
		throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
	}

	if (trip.creator.toString() !== userId) {
		throw new AppError('Unauthorized', `You are not authorized to ${action} trip`, 403, 'MongoDB');
	}

	if (notAllowedStatuses.includes(trip.status)) {
		throw new AppError('Conflict', `Cannot perform ${action} while trip is in ${trip.status} status.`, 409, 'MongoDB');
	}
	throw new AppError('InternalError', `Error ${action} trip`, 500, 'MongoDB');
}
