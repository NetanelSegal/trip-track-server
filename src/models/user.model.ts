import mongoose from 'mongoose';
import { Types } from 'trip-track-package';

const userSchema = new mongoose.Schema<Types['User']['Model']>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		name: { type: String, required: false },
		imageUrl: { type: String, required: false },
		role: { type: String, enum: ['user'], default: 'user' },
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

export const UserModel = mongoose.model<Types['User']['Model']>('User', userSchema);
