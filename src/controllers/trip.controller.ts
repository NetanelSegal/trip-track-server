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
	mongoGetTripsUserIsInParticipants,
	mongoUpdateTripReward,
	redisInitializeTripExperiences,
} from '../services/trip.service';
import { RequestJWTPayload } from '../types';
import { s3Service } from '../services/S3.service';
import mongoose from 'mongoose';

export const createTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const file = req.file;
		const { creator, ...data } = req.body;
		const tripData = { creator: (req as RequestJWTPayload).user._id, ...data };

		if (file) {
			const s3Response = await s3Service.uploadFile(file.path, file.filename, file.mimetype);
			fs.unlinkSync(file.path);
			tripData.reward = { ...tripData.reward, image: s3Response.Location };
		}

		const trip = await mongoCreateTrip(tripData);

		res.json(trip);
	} catch (error) {
		next(error);
	}
};

export const startTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripId = req.params.id;
		const updatedTrip = await mongoUpdateTripStatus((req as RequestJWTPayload).user._id, tripId, 'started');
		const experienceCount = updatedTrip.stops.reduce((count, stop) => (stop.experience ? count + 1 : count), 0);
		const redisInitialTripResult = await redisInitializeTripExperiences(tripId, experienceCount, null);

		// TODO: think if we really want to add all the users to the trip here

		// const promises = updatedTrip.participants.map(({ userId: { name, imageUrl, _id } }) =>
		// 	redisAddUserToTrip(tripId, { userId: _id.toString(), imageUrl, name })
		// );

		// await Promise.all(promises);

		res.json({ updatedTrip });
	} catch (error) {
		next(error);
	}
};

export const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await mongoDeleteTrip((req as RequestJWTPayload).user._id, req.params.id);
		res.json({ message: 'Trip deleted successfully' });
	} catch (error) {
		next(error);
	}
};

export const getTripById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tripMongoData = await mongoGetTripById(req.params.id);

		if (tripMongoData.status === 'created') {
			res.json(tripMongoData);
			return;
		}

		const tripExperiencesData = await redisGetTripExperiences(req.params.id);

		const tripUsersLeaderboard = await redisGetLeaderboard(req.params.id);

		res.json({ ...tripMongoData, tripExperiencesData, tripUsersLeaderboard });
	} catch (error) {
		next(error);
	}
};

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { page, limit } = req.query;
		const trips = await mongoGetTrips((req as RequestJWTPayload).user._id, +page, +limit);
		res.json(trips);
	} catch (error) {
		next(error);
	}
};

export const getUserTripData = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = await redisGetUserTripData(req.params.id, (req as RequestJWTPayload).user._id);
		res.json(userData);
	} catch (error) {
		next(error);
	}
};

export const getAllUsersTripData = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const usersIds = await redisGetLeaderboard(req.params.id);

		const usersData = await Promise.all(
			usersIds.map(async (scoreToUserObject) => redisGetUserTripData(req.params.id, scoreToUserObject.value))
		);

		res.json(usersData);
	} catch (error) {
		next(error);
	}
};

export const getTripsUserIsInParticipants = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!mongoose.isValidObjectId((req as RequestJWTPayload).user._id)) {
			res.status(400).json({ message: 'Invalid user id' });
		}

		const trips = await mongoGetTripsUserIsInParticipants((req as RequestJWTPayload).user._id);
		res.json(trips);
	} catch (error) {
		next(error);
	}
};

export const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const trip = await mongoUpdateTrip((req as RequestJWTPayload).user._id, req.params.id, req.body);
		res.json(trip);
	} catch (error) {
		next(error);
	}
};

export const updateGuestUserNameInTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name } = req.body;
		const userData = await redisUpdateUserTripData(req.params.id, (req as RequestJWTPayload).user._id, { name });
		res.json(userData);
	} catch (error) {
		next(error);
	}
};

export const updateTripStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const isUpdated = await mongoUpdateTripStatus((req as RequestJWTPayload).user._id, req.params.id, req.body.status);

		res.json({
			message: `trip ${req.params.id} was ${isUpdated ? 'updated' : 'not updated'}`,
		});
	} catch (error) {
		next(error);
	}
};

export const addUserToTripParticipants = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const isAdded = await mongoAddUserToTripParticipants((req as RequestJWTPayload).user._id, req.params.id);
		res.json({ message: `user ${(req as RequestJWTPayload).user._id} was ${isAdded ? 'added' : 'not added'}` });
	} catch (error) {
		next(error);
	}
};

export const updateTripReward = async (req: Request, res: Response, next: NextFunction) => {
	try {
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

		const { deletedImage } = await mongoUpdateTripReward((req as RequestJWTPayload).user._id, req.params.id, {
			title,
			image,
		});

		if (deletedImage) {
			const url = new URL(deletedImage);
			const fileName = decodeURIComponent(url.pathname.split('/')[1]);
			await s3Service.deleteFile(fileName);
		}

		const newTrip = await mongoGetTripById(req.params.id);

		res.json(newTrip);
	} catch (error) {
		next(error);
	}
};

export const addUserToTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, imageUrl } = req.body;
		const userData = await redisAddUserToTrip(req.params.id, {
			userId: (req as RequestJWTPayload).user._id,
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
		await redisRemoveUserFromTrip(req.params.id, (req as RequestJWTPayload).user._id);
		res.json({
			message: `user ${(req as RequestJWTPayload).user._id} was seccussfuly deleted from trip ${req.params.id}`,
		});
	} catch (error) {
		next(error);
	}
};
