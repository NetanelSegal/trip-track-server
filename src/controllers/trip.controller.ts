import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import {
	mongoCreateTrip,
	mongoDeleteTrip,
	mongoGetTripById,
	mongoGetTrips,
	mongoUpdateTrip,
	mongoUpdateTripStatus,
	redisAddUserToTrip,
	redisGetUserTripData,
	redisRemoveUserFromTrip,
	redisUpdateUserTripData,
	redisGetLeaderboard,
	redisGetTripExperiences,
	mongoAddUserToTripParticipants,
	mongoRemoveUserFromTripParticipants,
	mongoGetTripsUserIsInParticipants,
	mongoUpdateTripReward,
	redisDeleteTrip,
	endTripMongoAndRedis,
	redisGetTripCurrentExpIndex,
	mongoUpdateGuides,
	startTripMongoAndRedis,
} from '../services/trip.service';
import { RequestJWTPayload } from '../types';
import { s3Service } from '../services/S3.service';
import RedisCache from '../services/redis.service';
import RedisTripKeys from '../utils/RedisTripKeys';

export const createTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as RequestJWTPayload).user._id;
		const file = req.file;
		const { creator, ...data } = req.body;

		const tripData = { creator: userId, ...data };

		if (file) {
			const s3Response = await s3Service.uploadFile(file.path, file.filename, file.mimetype);
			fs.unlinkSync(file.path);
			tripData.reward = { ...tripData.reward, image: s3Response.Location };
		}

		const trip = await mongoCreateTrip(tripData);

		const tripRedisKey = RedisTripKeys.tripById(trip._id.toString());
		await RedisCache.deleteKey(tripRedisKey);

		res.json(trip);
	} catch (error) {
		next(error);
	}
};

export const startTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as RequestJWTPayload).user._id;
		const tripId = req.params.id;
		const updatedTrip = await startTripMongoAndRedis(tripId, userId);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json({ updatedTrip });
	} catch (error) {
		next(error);
	}
};

export const endTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const updatedTrip = await endTripMongoAndRedis(tripId, userId);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json({ updatedTrip });
	} catch (error) {
		next(error);
	}
};

export const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const usersIds = await redisGetLeaderboard(tripId);
		const promises = usersIds.map(({ value }) => redisRemoveUserFromTrip(tripId, value));
		await Promise.all(promises);

		await redisDeleteTrip(tripId);

		const deletedTrip = await mongoDeleteTrip(userId, tripId);

		const imageUrl = deletedTrip?.reward?.image;

		if (imageUrl) {
			const url = new URL(imageUrl);
			const s3Key = decodeURIComponent(url.pathname.substring(1));
			await s3Service.deleteFile(s3Key);
		}

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json({ message: 'Trip deleted successfully' });
	} catch (error) {
		next(error);
	}
};

export const getTripById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const tripRedisKey = RedisTripKeys.tripById(tripId);

		const tripData = await RedisCache.getSetValue({
			key: tripRedisKey,
			callbackFn: () => mongoGetTripById(tripId),
			expirationTime: 60 * 60 * 24,
		});

		if (tripData.status !== 'started') {
			res.json(tripData);
			return;
		}

		const tripExperiencesData = await redisGetTripExperiences(tripId);

		const tripUsersLeaderboard = await redisGetLeaderboard(tripId);

		res.json({ ...tripData, tripExperiencesData, tripUsersLeaderboard });
	} catch (error) {
		next(error);
	}
};

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { page, limit } = req.query;
		const userId = (req as RequestJWTPayload).user._id;

		const trips = await mongoGetTrips(userId, +page, +limit);

		res.json(trips);
	} catch (error) {
		next(error);
	}
};

export const getUserTripData = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;
		const userData = await redisGetUserTripData(tripId, userId);
		res.json(userData);
	} catch (error) {
		next(error);
	}
};

export const getAllUsersTripData = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const usersIds = await redisGetLeaderboard(tripId);

		const usersData = await Promise.all(
			usersIds.map(async ({ value: userId }) => redisGetUserTripData(tripId, userId))
		);

		res.json(usersData);
	} catch (error) {
		next(error);
	}
};

export const getTripsUserIsInParticipants = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as RequestJWTPayload).user._id;
		const trips = await mongoGetTripsUserIsInParticipants(userId);
		res.json(trips);
	} catch (error) {
		next(error);
	}
};

export const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const trip = await mongoUpdateTrip((req as RequestJWTPayload).user._id, tripId, req.body);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json(trip);
	} catch (error) {
		next(error);
	}
};

export const updateGuestUserNameInTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const { name } = req.body;

		const userData = await redisUpdateUserTripData(tripId, userId, { name });

		res.json(userData);
	} catch (error) {
		next(error);
	}
};

export const updateTripStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;
		const status = req.body.status;

		const isUpdated = await mongoUpdateTripStatus(userId, tripId, status);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json({
			message: `trip ${tripId} was ${isUpdated ? 'updated' : 'not updated'}`,
		});
	} catch (error) {
		next(error);
	}
};

export const addUserToTripParticipants = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const isAdded = await mongoAddUserToTripParticipants(userId, tripId);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json({ message: `user ${userId} was ${isAdded ? 'added' : 'not added'}` });
	} catch (error) {
		next(error);
	}
};

export const removeUserFromTripParticipants = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const isRemoved = await mongoRemoveUserFromTripParticipants(userId, tripId);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json({ message: `user ${userId} was ${isRemoved ? 'removed' : 'not removed'}` });
	} catch (error) {
		next(error);
	}
};

export const updateTripReward = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const {
			file,
			body: { title },
		} = req;

		let image: string | undefined;

		if (file) {
			const s3Response = await s3Service.uploadFile(file.path, file.filename, file.mimetype);
			fs.unlinkSync(file.path);
			image = s3Response.Location;
		}

		const { deletedImage } = await mongoUpdateTripReward(userId, tripId, {
			title,
			image,
		});

		if (deletedImage) {
			const url = new URL(deletedImage);
			const fileName = decodeURIComponent(url.pathname.split('/')[1]);
			await s3Service.deleteFile(fileName);
		}

		const newTrip = await mongoGetTripById(tripId);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json(newTrip);
	} catch (error) {
		next(error);
	}
};

export const addUserToTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const { name, imageUrl } = req.body;

		const userData = await redisAddUserToTrip(tripId, {
			userId,
			name,
			imageUrl,
		});

		res.json(userData);
	} catch (error) {
		next(error);
	}
};

export const removeUserFromTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		await redisRemoveUserFromTrip(tripId, userId);

		res.json({
			message: `user ${userId} was seccussfuly deleted from trip ${tripId}`,
		});
	} catch (error) {
		next(error);
	}
};

export const getTripCurrentExpIndex = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = await redisGetTripCurrentExpIndex(req.params.id);

		res.json({
			data,
		});
	} catch (error) {
		next(error);
	}
};

export const updeteGuideInTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const userId = (req as RequestJWTPayload).user._id;

		const { guideIds } = req.body;

		await mongoUpdateGuides(tripId, userId, guideIds);

		const tripRedisKey = RedisTripKeys.tripById(tripId);
		await RedisCache.deleteKey(tripRedisKey);

		res.json({
			message: `trip ${tripId} was seccussfuly updated with guides`,
		});
	} catch (error) {
		next(error);
	}
};
