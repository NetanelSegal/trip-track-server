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
type ActionArgs =
	| {
			tripId: string;
			userId: string;
			action: 'update status' | 'finish';
			statusToUpdate: TripStatus;
			nutAllowedStatuses: TripStatus[];
	  }
	| {
			tripId: string;
			userId: string;
			action: 'update' | 'update reward' | 'delete';
			nutAllowedStatuses: TripStatus[];
	  };

export async function handleWhyTripNotFoundMongo(args: ActionArgs) {
	const { tripId, userId, action, nutAllowedStatuses } = args;

	const trip = await Trip.findById(tripId);
	if (!trip) {
		throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
	}

	if (trip.creator.toString() !== userId) {
		throw new AppError('Unauthorized', `You are not authorized to ${action} trip`, 403, 'MongoDB');
	}

	if (nutAllowedStatuses.includes(trip.status)) {
		const { statusToUpdate } = args as Extract<ActionArgs, { action: 'update status' }>;
		console.log('statusToUpdate', statusToUpdate);

		if (trip.status === statusToUpdate) {
			throw new AppError('BadRequest', 'Trip is already in this status', 400, 'MongoDB');
		}
		throw new AppError('Forbidden', `You forbidden to ${action} trip with status: ${trip.status}`, 403, 'MongoDB');
	}
	throw new AppError('InternalError', `Error ${action} trip`, 500, 'MongoDB');
}
