import { NextFunction, Request, Response } from 'express';
import { getUserById, updateUser } from '../services/user.service';
import { RequestJWTPayload } from '../types';
import { Types } from 'trip-track-package';
import { AppError } from '../utils/AppError';
import axios from 'axios';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId } = req.params;
		const user = await getUserById(userId);
		res.json(user);
	} catch (error) {
		next(error);
	}
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as RequestJWTPayload).user._id;
		const { email, ...restUpdateDate } = req.body as Types['User']['Model'];

		const updatedUser = await updateUser(userId, restUpdateDate);
		if (!updatedUser) {
			res.status(404).json({ message: 'User not found or could not be updated' });
			return;
		}
		res.json(updatedUser);
	} catch (error) {
		next(error);
	}
};

export const getRandomUserName = async (req: Request, res: Response) => {
	try {
		const { data } = await axios.get('https://fantasyname.lukewh.com/');
		res.json(data);
		console.log(data);
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		throw new AppError('AppError', error.message, 500, 'RandomName');
	}
};
