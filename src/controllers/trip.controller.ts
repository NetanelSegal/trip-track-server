import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import {
	mongoCreateTrip,
	mongoDeleteTrip,
	mongoGetTripById,
	mongoGetTrips,
	mongoUpdateTrip,
	redisAddUserToTrip,
	redisGetUserTripData,
	redisRemoveUserFromTrip,
	redisUpdateUserTripData,
} from '../services/trip.service';
import { RequestJWTPayload } from '../types';
import { s3Service } from '../services/S3.service';

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
		const trip = await mongoGetTripById(req.params.id);
		res.json(trip);
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

export const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const trip = await mongoUpdateTrip((req as RequestJWTPayload).user._id, req.params.id, req.body);
		res.json(trip);
	} catch (error) {
		next(error);
	}
};

export const addUserToTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = await redisAddUserToTrip(
			req.params.id,
			(req as RequestJWTPayload).user._id,
			(req as RequestJWTPayload).user.name
		);
		res.json(userData);
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

export const updateGuestUserNameInTrip = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name } = req.body;
		const userData = await redisUpdateUserTripData(req.params.id, (req as RequestJWTPayload).user._id, { name });
		res.json(userData);
	} catch (error) {
		next(error);
	}
};
