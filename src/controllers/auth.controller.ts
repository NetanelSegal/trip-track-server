import { NextFunction, Request, Response } from 'express';
import { generateRandomDigitsCode, generateUUID } from '../utils/functions.utils';
import { getUserById, userGetOrCreateMongo } from '../services/user.service';
import { generateAccessToken, generateRefreshToken, generateGuestToken } from '../utils/jwt.utils';
import { RequestJWTPayload } from '../types';
import { saveUserDataInRedis, sendEmailWithCodeToUser, validateCodeWithRedis } from '../services/auth.service';
import { ENV } from '../env.config';
import { Types } from 'trip-track-package';

const REDIS_EXP_TIME_MIN = 10;

export const sendCode = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email } = req.body as Types['Auth']['SendCode'];

		const code = generateRandomDigitsCode(6);

		await saveUserDataInRedis(email, code, REDIS_EXP_TIME_MIN);

		if (ENV !== 'development') {
			await sendEmailWithCodeToUser(email, code);
		}

		res.status(202).json({
			message: `code sent successfully and will expire in ${REDIS_EXP_TIME_MIN} minutes`,
			...(ENV === 'development' ? { code } : {}),
		});
	} catch (error) {
		next(error);
	}
};

export const verifyCode = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, code } = req.body as Types['Auth']['VerifyCode'];

		await validateCodeWithRedis(email, code);

		const { user, isNew } = await userGetOrCreateMongo(email);

		// Generate tokens
		const accessToken = generateAccessToken({
			_id: user._id.toString(),
			email,
			role: user.role,
		});

		const refreshToken = generateRefreshToken({
			_id: user._id.toString(),
			email,
			role: user.role,
		});

		res.clearCookie('guestToken');

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: ENV === 'production',
				sameSite: 'strict',
				maxAge: 15 * 60 * 1000,
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.status(200)
			.json({
				user: {
					_id: user._id.toString(),
					email,
					role: user.role,
					...(user.name && user.imageUrl ? { name: user.name, imageUrl: user.imageUrl } : {}),
				},
				updatedAt: user.updatedAt,
				createdAt: user.createdAt,
				isNewUser: isNew,
			});
	} catch (error) {
		next(error);
	}
};

export const createGuestToken = async (req: Request, res: Response) => {
	const uuid = generateUUID();
	const guestToken = generateGuestToken({ _id: uuid, role: 'guest' });

	res
		.cookie('guestToken', guestToken, {
			httpOnly: true,
			secure: ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 60 * 1000,
		})
		.status(200)
		.json({
			message: 'Guest token created successfully',
			uuid,
		});
};

export const updateGuestInfoToken = async (req: Request, res: Response) => {
	const { name, imageUrl } = req.body;
	const uuid = generateUUID();
	const guestToken = generateGuestToken({ _id: uuid, role: 'guest', name, imageUrl });

	res
		.cookie('guestToken', guestToken, {
			httpOnly: true,
			secure: ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 60 * 1000,
		})
		.status(200)
		.json({
			message: 'Guest token updated successfully',
			uuid,
		});
};

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { user } = req as RequestJWTPayload;
		if (!user.role || user.role === 'guest') {
			res.status(200).json((req as RequestJWTPayload).user);
			return;
		}
		const mongoUser = await getUserById(user._id);
		res.status(200).json(mongoUser);
	} catch (error) {
		next(error);
	}
};

export const generateUserTokens = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await getUserById((req as RequestJWTPayload).user._id);

		const accessToken = generateAccessToken({
			_id: user._id.toString(),
			email: user.email,
			role: user.role,
		});

		const refreshToken = generateRefreshToken({
			_id: user._id.toString(),
			email: user.email,
			role: user.role,
		});

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: ENV === 'production',
				sameSite: 'strict',
				maxAge: 15 * 60 * 1000,
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.status(200)
			.json({
				user,
			});
	} catch (error) {
		next(error);
	}
};
