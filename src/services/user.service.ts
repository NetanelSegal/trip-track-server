import { Types } from 'trip-track-package';
import { UserModel } from '../models/user.model';
import { TripsRelatedModel, TTripsRelatedSchema } from '../models/tripsRelated.model';
import { AppError } from '../utils/AppError';

export async function userGetOrCreateMongo(email: string): Promise<{ user: Types['User']['Model']; isNew: boolean }> {
	try {
		let user = await UserModel.findOne({ email });

		if (!user) {
			user = await UserModel.create({ email });
			const tripRelated = await TripsRelatedModel.create({ userId: user._id, tripsId: [] });
			if (!tripRelated) {
				throw new AppError('TripRelated not found', 'TripRelated not found', 404, 'MongoDB');
			}
			return { user, isNew: true };
		}

		return { user, isNew: false };
	} catch (error) {
		if (error instanceof AppError) throw error;
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

export async function deleteUser(userId: string): Promise<Types['User']['Model'] | null> {
	try {
		const user = await UserModel.findByIdAndDelete(userId);
		if (!user) {
			throw new AppError('User not found', 'User not found', 404, 'MongoDB');
		}
		return user;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
}

export async function getTripsRelatedByUserId(userId: string): Promise<TTripsRelatedSchema | null> {
	try {
		const tripRelated = await TripsRelatedModel.findOne({ userId });
		if (!tripRelated) {
			throw new AppError('TripRelated not found', 'TripRelated not found', 404, 'MongoDB');
		}
		return tripRelated;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.statusCode || 500, 'MongoDB');
	}
}

export async function addTripToUser(userId: string, tripId: string): Promise<TTripsRelatedSchema | null> {
	try {
		const updatedRecord = await TripsRelatedModel.findOneAndUpdate(
			{ userId },
			{ $addToSet: { tripsId: tripId } },
			{ new: true, upsert: true }
		);

		return updatedRecord;
	} catch (error) {
		throw new Error(`Error adding trip to user: ${error.message}`);
	}
}

export async function removeTripFromUser(userId: string, tripId: string): Promise<TTripsRelatedSchema | null> {
	try {
		const updatedRecord = await TripsRelatedModel.findOneAndUpdate(
			{ userId },
			{ $pull: { tripsId: tripId } },
			{ new: true }
		);

		return updatedRecord;
	} catch (error) {
		throw new Error(`Error removing trip from user: ${error.message}`);
	}
}

export async function deleteTripsRelated(userId: string) {
	try {
		const deletedRecord = await TripsRelatedModel.findOneAndDelete({ userId });
		return deletedRecord;
	} catch (error) {
		throw new Error(`Error deleting trips related record: ${error.message}`);
	}
}
