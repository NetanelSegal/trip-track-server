import { Trip } from '../models/trip.model';
import { AppError } from '../utils/AppError';
import RedisCache from './redis.service';
import { Trip as TripType } from '../types/trip';
import { TripStatusArray, Types } from 'trip-track-package';
import { handleWhyTripNotFoundMongo } from '../utils/functions.utils';

interface Participant {
	userId: Types['User']['Model'];
	score: number;
}

export interface IRedisUserTripData {
	imageUrl: string;
	name: string;
	score: number[]; // score for each experience in the trip
	finishedExperiences: boolean[];
}

interface IRedisTripExperience {
	winners: [string, string, string]; // array of user ids for 1st 2nd and 3rd place
	active: boolean; // is experience active and users can enter the experience
}

type PopulatedTripWithParticipants = Omit<TripT, 'participants'> & { participants: Participant[] };

type TripT = TripType;

interface TripService {
	// mongo related functions
	mongoCreateTrip: (data: TripT) => Promise<TripT>;
	mongoUpdateTrip: (userId: string, tripId: string, data: Types['Trip']['Update']) => Promise<TripT>;
	mongoGetTripById: (id: string) => Promise<TripT>;
	mongoGetTrips: (userId: string, page?: number, limit?: number) => Promise<TripT[]>;
	mongoDeleteTrip: (userId: string, tripId: string) => Promise<TripT>;
	mongoUpdateTripStatus: (
		userId: string,
		tripId: string,
		status: (typeof TripStatusArray)[number]
	) => Promise<PopulatedTripWithParticipants>;
	mongoAddUserToTripParticipants: (userId: string, tripId: string) => Promise<boolean>;
	mongoRemoveUserFromTripParticipants: (userId: string, tripId: string) => Promise<boolean>;
	mongoGetTripsUserIsInParticipants: (userId: string) => Promise<TripT[]>;
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
	redisInitializeTripExperiences: (tripId: string, countOfExperiences: number) => Promise<void>;
	redisGetTripExperiences: (tripId: string) => Promise<IRedisTripExperience[]>;
	redisUpdateTripExperiences: (
		tripId: string,
		experienceIndex: number,
		data: IRedisTripExperience
	) => Promise<IRedisTripExperience>;
	redisDeleteTrip: (tripId: string) => Promise<void>;

	// end trip in redis and mongo
	redisAndMongoEndTrip: (
		tripId: string,
		userId: string,
		participants: { userId: string; score: number }[]
	) => Promise<PopulatedTripWithParticipants>;
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
		const updatedTrip = await Trip.findOneAndUpdate(
			{ _id: tripId, creator: userId, status: { $nin: ['started', 'completed'] } },
			data,
			{ new: true }
		);

		if (!updatedTrip) {
			await handleWhyTripNotFoundMongo({
				tripId,
				userId,
				action: 'update',
				notAllowedStatuses: ['started', 'completed'],
			});
		}

		return updatedTrip;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoGetTripById: TripService['mongoGetTripById'] = async (tripId) => {
	try {
		const trip = await Trip.findById(tripId).populate('creator').populate('guides');
		if (!trip) {
			throw new AppError('Trip not found', 'Trip not found', 404, 'MongoDB');
		}
		return trip.toJSON();
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
		const tripDeleted = await Trip.findOneAndDelete({
			_id: tripId,
			creator: userId,
			status: { $nin: ['started', 'completed'] },
		});

		if (!tripDeleted) {
			await handleWhyTripNotFoundMongo({
				tripId,
				userId,
				action: 'delete',
				notAllowedStatuses: ['started', 'completed'],
			});
		}

		return tripDeleted;
	} catch (error: any) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoUpdateTripStatus: TripService['mongoUpdateTripStatus'] = async (userId, tripId, status) => {
	try {
		const updateResult = await Trip.findOneAndUpdate(
			{
				_id: tripId,
				creator: userId,
				status: { $ne: status },
			},
			{ status },
			{ new: true }
		).populate<{ participants: Participant[] }>('participants.userId');

		if (!updateResult) {
			await handleWhyTripNotFoundMongo({
				tripId,
				userId,
				action: 'update-status',
				notAllowedStatuses: [status],
			});
		}

		return updateResult;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoAddUserToTripParticipants: TripService['mongoAddUserToTripParticipants'] = async (userId, tripId) => {
	try {
		const result = await Trip.updateOne(
			{
				_id: tripId,
				'participants.userId': { $ne: userId },
			},
			{
				$addToSet: { participants: { userId, score: 0 } },
			}
		);

		if (result.modifiedCount === 0) {
			const tripExists = await Trip.exists({ _id: tripId });
			if (!tripExists) {
				throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
			}
			throw new AppError('BadRequest', 'User is already a participant in this trip', 400, 'MongoDB');
		}

		return true;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoRemoveUserFromTripParticipants: TripService['mongoRemoveUserFromTripParticipants'] = async (
	userId,
	tripId
) => {
	try {
		const result = await Trip.findOneAndUpdate(
			{
				_id: tripId,
				'participants.userId': userId,
			},
			{
				$pull: { participants: { userId } },
			},
			{ new: true }
		);

		if (!result) {
			const tripExists = await Trip.exists({ _id: tripId });
			if (!tripExists) {
				throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
			}
			throw new AppError('NotFound', 'User is not a participant in this trip', 400, 'MongoDB');
		}

		return true;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoGetTripsUserIsInParticipants: TripService['mongoGetTripsUserIsInParticipants'] = async (
	userId: string
) => {
	try {
		const trips = await Trip.find({ participants: { $elemMatch: { userId } } }).populate('participants.userId');

		return trips;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};

export const mongoUpdateTripReward: TripService['mongoUpdateTripReward'] = async (userId, tripId, { title, image }) => {
	try {
		const updateTripReward = await Trip.findOne({
			_id: tripId,
			creator: userId,
			status: { $nin: ['started', 'completed'] },
		});
		if (!updateTripReward) {
			await handleWhyTripNotFoundMongo({
				tripId,
				userId,
				action: 'update-reward',
				notAllowedStatuses: ['started', 'completed'],
			});
		}

		let lastRewardImage: string | null = null;
		const updateFields = { 'reward.title': title };

		if (image) {
			updateFields['reward.image'] = image;
			lastRewardImage = updateTripReward.reward?.image;
		}

		await updateTripReward.updateOne({ $set: updateFields });

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
	countOfExperiences
) => {
	const tripExperiencesKey = `trip_experiences:${tripId}`;
	const tripExperiences: IRedisTripExperience[] = Array.from({ length: countOfExperiences }, (_) => ({
		winners: [null, null, null],
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

// redis and mongo
export const redisAndMongoEndTrip: TripService['redisAndMongoEndTrip'] = async (tripId, userId, participants) => {
	try {
		const completedStatus = 'completed';
		const updateResult = await Trip.findOneAndUpdate(
			{
				_id: tripId,
				creator: userId,
				status: { $ne: 'completed' },
			},
			{
				status: completedStatus,
				participants,
			},
			{ new: true }
		).populate<{ participants: Participant[] }>('participants.userId');

		if (!updateResult) {
			await handleWhyTripNotFoundMongo({
				tripId,
				userId,
				action: 'finish',
				notAllowedStatuses: [completedStatus],
			});
		}

		return updateResult;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
};
