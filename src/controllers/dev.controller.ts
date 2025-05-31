import { Request, Response, NextFunction } from 'express';
import { Trip } from '../models/trip.model';
import { Types as MongoTypes } from 'mongoose';
import { AppError } from '../utils/AppError';
import {
	redisInitializeTripExperiences,
	redisInitUsersInTripExpRange,
	redisInitExpIndex,
	redisRemoveUserFromTrip,
	redisDeleteTrip,
} from '../services/trip.service';

import {
	devRedisGetTripExperiences,
	devRedisGetUsersInTripExperinceRange,
	devRedisGetTripCurrentExpIndex,
	devRedisGetLeaderboard,
} from '../services/dev.service';
import { TripStatusArray } from 'trip-track-package';

export const devResetTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// End trip
		await endTripHelper(req, next);

		// Start trip
		await startTripHelper(req, next);

		res.json({
			success: true,
			message: 'Trip reset successfully',
		});
	} catch (error) {
		next(error);
	}
};

export const devStartTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const updatedTrip = await startTripHelper(req, next);

		res.json({
			success: true,
			message: 'Trip started successfully (dev mode)',
			trip: updatedTrip,
		});
	} catch (error) {
		next(error);
	}
};

export const devEndTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const updateResult = await endTripHelper(req, next);

		res.json({
			success: true,
			message: 'Trip ended successfully (dev mode)',
			trip: updateResult,
		});
	} catch (error) {
		next(error);
	}
};

export const devUpdateTripStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const status = req.params.status as any;

		if (!TripStatusArray.includes(status)) {
			return next(new AppError('BadRequest', `Invalid status: ${status}`, 400, 'Validation'));
		}

		const trip = await Trip.findById(tripId);
		if (!trip) {
			return next(new AppError('NotFound', 'Trip not found', 404, 'MongoDB'));
		}

		const updatedTrip = await Trip.findByIdAndUpdate(tripId, { status }, { new: true }).populate('participants.userId');

		res.json({
			success: true,
			message: `Trip status updated to ${status} (dev mode)`,
			trip: updatedTrip,
		});
	} catch (error) {
		next(error);
	}
};

export const devGetTripDebugInfo = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;

		const trip = await Trip.findById(tripId)
			.populate('participants.userId creator guides')
			.catch(() => null);

		const experiences = await devRedisGetTripExperiences(tripId);
		const usersInExpRange = await devRedisGetUsersInTripExperinceRange(tripId);
		const currentExpIndex = await devRedisGetTripCurrentExpIndex(tripId);
		const leaderboard = await devRedisGetLeaderboard(tripId);

		res.json({
			success: true,
			data: {
				mongoData: trip || { message: 'Trip not found in MongoDB' },
				redisData: {
					experiences,
					usersInExpRange,
					currentExpIndex,
					leaderboard,
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: `Error in devGetTripDebugInfo: ${error.message}`,
			error: error.stack,
		});
	}
};

const startTripHelper = async (req: Request, next: NextFunction) => {
	const tripId = req.params.id;

	const trip = await Trip.findById(tripId);
	if (!trip) {
		throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
	}

	const updatedTrip = await Trip.findByIdAndUpdate(tripId, { status: 'started' }, { new: true }).populate(
		'participants.userId'
	);

	const experienceCount = updatedTrip.stops.reduce((count, stop) => (stop.experience ? count + 1 : count), 0);
	await redisInitializeTripExperiences(tripId, experienceCount);
	await redisInitUsersInTripExpRange(tripId);
	await redisInitExpIndex(tripId);

	return updatedTrip;
};

const endTripHelper = async (req: Request, next: NextFunction) => {
	const tripId = req.params.id;

	const trip = await Trip.findById(tripId);
	if (!trip) {
		throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
	}

	const usersIds = await devRedisGetLeaderboard(tripId);
	const participants = usersIds
		.filter(({ value }) => MongoTypes.ObjectId.isValid(value))
		.map(({ value, score }) => ({ userId: value, score }));

	const updateResult = await Trip.findByIdAndUpdate(
		tripId,
		{
			status: 'completed',
			participants,
		},
		{ new: true }
	).populate('participants.userId');

	usersIds.forEach(async ({ value }) => {
		try {
			await redisRemoveUserFromTrip(tripId, value);
		} catch (error) {
			console.log(error);
		}
	});
	await redisDeleteTrip(tripId);

	return updateResult;
};
