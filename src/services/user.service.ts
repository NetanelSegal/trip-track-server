import { Types } from 'trip-track-package';
import { UserModel } from '../models/user.model';
import { AppError } from '../utils/AppError';

export async function userGetOrCreateMongo(email: string): Promise<{ user: Types['User']['Model']; isNew: boolean }> {
	try {
		let user = await UserModel.findOne({ email });

		if (!user) {
			user = await UserModel.create({ email });
			return { user, isNew: true };
		}

		return { user, isNew: false };
	} catch (error) {
		throw new AppError(error.name, error.message, 500, 'MongoDB');
	}
}

export async function getUserById(userId: string): Promise<Types['User']['Model'] | null> {
	try {
		const user = await UserModel.findById(userId);
		if (!user) {
			throw new AppError('User not found', 'User not found', 404, 'MongoDB');
		}
		return user;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
}

export async function updateUser(
	userId: string,
	data: Partial<Types['User']['Model']>
): Promise<Types['User']['Model'] | null> {
	try {
		const user = await UserModel.findByIdAndUpdate(userId, data, {
			new: true,
		});

		if (!user) {
			throw new AppError('User not found', 'User not found', 404, 'MongoDB');
		}
		return user;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
}

export async function updateUserProfileImage(
	userId: string,
	imageUrl: string
): Promise<{ updatedUser: Types['User']['Model']; lastImageUrl: string } | null> {
	try {
		const user = await getUserById(userId);
		if (!user) {
			throw new AppError('User not found', 'User not found', 404, 'MongoDB');
		}

		const lastImageUrl = user.imageUrl;

		const updatedUser = await updateUser(userId, { imageUrl });
		if (!updatedUser) {
			throw new AppError('User not found', 'User not found', 404, 'MongoDB');
		}

		return { updatedUser, lastImageUrl };
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
}
