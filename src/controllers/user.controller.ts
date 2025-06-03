import { NextFunction, Request, Response } from 'express';
import { getUserById, updateUser, updateUserProfileImage } from '../services/user.service';
import { RequestJWTPayload } from '../types';
import { Types } from 'trip-track-package';
import { AppError } from '../utils/AppError';
import axios from 'axios';
import { s3Service } from '../services/S3.service';
import { Logger } from '../utils/Logger';

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

export const updateProfileImage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as RequestJWTPayload).user._id;
		const { file } = req;

		if (!file) {
			throw new AppError('File not found', 'File not found', 404, 'File');
		}

		const fileLocation = (await s3Service.uploadFile(file.path, file.filename, file.mimetype)).Location;

		const { updatedUser, lastImageUrl } = await updateUserProfileImage(userId, fileLocation);

		if (!updatedUser) {
			await s3Service.deleteFile(fileLocation);
			res.status(404).json({ message: 'User not found or could not be updated' });
			return;
		}

		const url = new URL(lastImageUrl);
		const s3Key = decodeURIComponent(url.pathname.substring(1));

		try {
			await s3Service.getFile(s3Key);
			await s3Service.deleteFile(s3Key);
			Logger.info(`File ${s3Key} deleted successfully`);
		} catch (error) {
			Logger.info(`File ${s3Key} is not from our server`);
		}

		res.json({ updatedUser, lastImageUrl });
	} catch (error) {
		next(error);
	}
};

export const getRandomUserName = async (req: Request, res: Response) => {
	try {
		const { data } = await axios.get('https://fantasyname.lukewh.com/');
		res.json(data);
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		throw new AppError('AppError', error.message, 500, 'RandomName');
	}
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.clearCookie('accessToken', {
			httpOnly: true,
			secure: process.env.ENV === 'production',
			sameSite: 'strict',
		});
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.ENV === 'production',
			sameSite: 'strict',
		});
		res.clearCookie('guestToken', {
			httpOnly: true,
			secure: process.env.ENV === 'production',
			sameSite: 'strict',
		});
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		next(error);
	}
};
