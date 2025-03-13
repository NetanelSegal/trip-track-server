import { Types } from 'trip-track-package';
import { Trip } from '../models/trip.model';
import { AppError } from '../utils/AppError';
import RedisCache from './redis.service';
import { Trip as TripType } from '../types/trip';
import { UpdateResult } from 'mongoose';

export interface IRedisUserTripData {
	imageUrl: string;
	name: string;
	score: number[];
	finishedExperiences: boolean[];
}

interface IRedisTripExperience {
	winners: [string, string, string];
	active: boolean;
}

type TripT = TripType;

interface TripService {
	// mongo related functions
	mongoCreateTrip: (data: TripT) => Promise<TripT>;
	mongoUpdateTrip: (userId: string, tripId: string, data: TripT) => Promise<TripT>;
	mongoGetTripById: (id: string) => Promise<TripT>;
	mongoGetTrips: (userId: string, page?: number, limit?: number) => Promise<TripT[]>;
	mongoDeleteTrip: (userId: string, tripId: string) => Promise<void>;
	mongoUpdateTripStatus: (userId: string, tripId: string, status: string) => Promise<boolean>;
	mongoUpdateTripReward: (
		userId: string,
		tripId: string,
		reward: TripType['reward']
	) => Promise<{ deletedImage: string | null }>;

	// redis related functions
	redisAddUserToTrip: (
		tripId: string,
		data: { userId: string; name: string; imageUrl: string }
	) => Promise<IRedisUserTripData>;
	redisGetUserTripData: (tripId: string, userId: string) => Promise<IRedisUserTripData>;
	redisRemoveUserFromTrip: (tripId: string, userId: string) => Promise<boolean>;
	redisUpdateUserTripData: (
		tripId: string,
		userId: string,
		data: Partial<IRedisUserTripData>
	) => Promise<IRedisUserTripData>;
	redisGetLeaderboard: (tripId: string) => Promise<
		{
			score: number;
			value: string;
		}[]
	>;
	redisInitializeTripExperiences: (
		tripId: string,
		countOfExperiences: number,
		winnersInitialValue: IRedisTripExperience['winners'][0]
	) => Promise<void>;
	redisGetTripExperiences: (tripId: string) => Promise<IRedisTripExperience[]>;
	redisUpdateTripExperiences: (
		tripId: string,
		experienceIndex: number,
		data: IRedisTripExperience
	) => Promise<IRedisTripExperience>;
	redisDeleteTrip: (tripId: string) => Promise<void>;
}

// mongo
export const mongoCreateTrip: TripService['mongoCreateTrip'] = async (data) => {
	try {
		const trip = await Trip.create(data);
		return trip;
	} catch (error) {
		throw new AppError(error.name, error.message, 500, 'MongoDB');
	}
};

export const mongoUpdateTrip: TripService['mongoUpdateTrip'] = async (userId, tripId, data) => {
	try {
		const trip = await Trip.findOneAndUpdate({ _id: tripId, creator: userId }, data, { new: true });

		if (!trip) {
			throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
		}

		return trip;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoGetTripById: TripService['mongoGetTripById'] = async (tripId) => {
	try {
		const trip = await Trip.findById(tripId);
		if (!trip) {
			throw new AppError('Trip not found', 'Trip not found', 404, 'MongoDB');
		}
		return trip;
	} catch (error: any) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};
export const mongoGetTrips: TripService['mongoGetTrips'] = async (userId, page = 1, limit = 10) => {
	try {
		const skip = (page - 1) * limit;
		const trips = await Trip.find({ creator: userId }).skip(skip).limit(limit);
		if (!trips) {
			throw new AppError('Trips not found', 'Trips not found', 404, 'MongoDB');
		}
		return trips;
	} catch (error: any) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoDeleteTrip: TripService['mongoDeleteTrip'] = async (userId, tripId) => {
	try {
		const trip = await Trip.findById(tripId);

		if (!trip) {
			throw new AppError('NotFount', 'Trip not found', 404, 'MongoDB');
		}
		if (!trip) {
			throw new AppError('NotFount', 'Trip not found', 404, 'MongoDB');
		}

		if (trip.creator.toString() !== userId) {
			throw new AppError('Unauthorized', 'You are not authorized to delete this trip', 403, 'MongoDB');
		}
		if (trip.creator.toString() !== userId) {
			throw new AppError('Unauthorized', 'You are not authorized to delete this trip', 403, 'MongoDB');
		}

		if ((await trip.deleteOne()).deletedCount === 0) {
			throw new AppError('InternalError', 'Error deleting trip', 500, 'MongoDB');
		}
	} catch (error: any) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoUpdateTripStatus: TripService['mongoUpdateTripStatus'] = async (userId, tripId, status) => {
	try {
		const trip = await Trip.findById(tripId);
		if (!trip) {
			throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
		}

		if (trip.creator.toString() !== userId) {
			throw new AppError('Unauthorized', 'You are not authorized to update this trip', 403, 'MongoDB');
		}

		if (status === trip.status) {
			throw new AppError('BadRequest', 'Trip is already in this status', 400, 'MongoDB');
		}

		const updateResult = await trip.updateOne({
			status,
		});

		if (updateResult.modifiedCount === 0) {
			throw new AppError('InternalError', 'Error updating trip', 500, 'MongoDB');
		}

		return true;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoUpdateTripReward: TripService['mongoUpdateTripReward'] = async (userId, tripId, { title, image }) => {
	try {
		const trip = await Trip.findOne({ _id: tripId, creator: userId });
		if (!trip) {
			throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
		}

		let lastRewardImage: string | null = null;
		const updateFields = { 'reward.title': title };

		if (image) {
			updateFields['reward.image'] = image;
			lastRewardImage = trip.reward?.image;
		}

		await trip.updateOne({ $set: updateFields });

		return { deletedImage: lastRewardImage };
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

// redis
export const redisAddUserToTrip: TripService['redisAddUserToTrip'] = async (tripId, { userId, name, imageUrl }) => {
	const userKey = `trip_user:${tripId}:${userId}`;
	const leaderboardKey = `trip_leaderboard:${tripId}`;

	const userTripData: IRedisUserTripData = {
		name: name,
		imageUrl,
		score: [],
		finishedExperiences: [],
	};

	await RedisCache.setKeyWithValue({
		key: userKey,
		value: userTripData,
		expirationTime: 60 * 60 * 24,
	});

	await RedisCache.addToSortedSet(leaderboardKey, { score: 0, value: userId });

	return userTripData;
};

export const redisRemoveUserFromTrip: TripService['redisRemoveUserFromTrip'] = async (tripId, userId) => {
	const userKey = `trip_user:${tripId}:${userId}`;
	const leaderboardKey = `trip_leaderboard:${tripId}`;

	let res = await RedisCache.deleteKey(userKey);
	if (res === 0) throw new AppError('TripRedisError', "Couldn't delete user data from redis");

	res = await RedisCache.removeFromSortedSet(leaderboardKey, userId);
	if (res === 0) throw new AppError('TripRedisError', "Couldn't delete user data from redis");

	return true;
};

export const redisUpdateUserTripData: TripService['redisUpdateUserTripData'] = async (tripId, userId, data) => {
	const userKey = `trip_user:${tripId}:${userId}`;
	const user = await RedisCache.getValueByKey<IRedisUserTripData>(userKey);

	if (!user) {
		throw new AppError('NotFount', 'User not found', 404, 'Redis');
	}

	await RedisCache.setKeyWithValue({
		key: userKey,
		value: { ...user, ...data },
		expirationTime: 60 * 60 * 24,
	});

	if (data.score?.length) {
		const leaderboardKey = `trip_leaderboard:${tripId}`;

		const newTotalScore = data.score.reduce((a, b) => a + b, 0);
		await RedisCache.addToSortedSet(leaderboardKey, {
			score: newTotalScore,
			value: userId,
		});
	}

	return { ...user, ...data };
};

export const redisGetUserTripData: TripService['redisGetUserTripData'] = async (tripId, userId) => {
	const userKey = `trip_user:${tripId}:${userId}`;
	const user = await RedisCache.getValueByKey<IRedisUserTripData>(userKey);
	return { ...user, userId };
};

export const redisGetLeaderboard: TripService['redisGetLeaderboard'] = async (tripId) => {
	const leaderboardKey = `trip_leaderboard:${tripId}`;
	const leaderboard = await RedisCache.getMembersFromSortedSet(leaderboardKey);
	return leaderboard;
};

export const redisInitializeTripExperiences: TripService['redisInitializeTripExperiences'] = async (
	tripId,
	countOfExperiences,
	winnersInitialValue
) => {
	const tripExperiencesKey = `trip_experiences:${tripId}`;
	const tripExperiences: IRedisTripExperience[] = Array.from({ length: countOfExperiences }, (_) => ({
		winners: [winnersInitialValue, winnersInitialValue, winnersInitialValue],
		active: false,
	}));
	await RedisCache.setKeyWithValue({
		key: tripExperiencesKey,
		value: tripExperiences,
		expirationTime: 60 * 60 * 24,
	});
};

export const redisGetTripExperiences: TripService['redisGetTripExperiences'] = async (tripId) => {
	const tripExperiencesKey = `trip_experiences:${tripId}`;
	const tripExperiences = await RedisCache.getValueByKey<IRedisTripExperience[]>(tripExperiencesKey);
	if (!tripExperiences) {
		throw new AppError('NotFount', 'Trip not found', 404, 'Redis');
	}
	return tripExperiences;
};

export const redisUpdateTripExperiences: TripService['redisUpdateTripExperiences'] = async (
	tripId,
	experienceIndex,
	experienceData
) => {
	const tripExperiencesKey = `trip_experiences:${tripId}`;
	const tripExperiences = await RedisCache.getValueByKey(tripExperiencesKey);
	if (!tripExperiences) {
		throw new AppError('NotFount', 'Trip not found', 404, 'Redis');
	}

	tripExperiences[experienceIndex] = experienceData;

	await RedisCache.setKeyWithValue({
		key: tripExperiencesKey,
		value: tripExperiences,
		expirationTime: 60 * 60 * 24,
	});
	return tripExperiences[experienceIndex];
};

export const redisDeleteTrip: TripService['redisDeleteTrip'] = async (tripId) => {
	const tripExperiencesKey = `trip_experiences:${tripId}`;
	const leaderboardKey = `trip_leaderboard:${tripId}`;
	await RedisCache.deleteKey(tripExperiencesKey);
	await RedisCache.deleteKey(leaderboardKey);
};
