import mongoose, { Schema, Types } from 'mongoose';
import { ExperienceType, Types as TTTypes, TripStatusArray } from 'trip-track-package';
import { Trip as TripType } from '../types/trip';

const StopSchema = new Schema<TTTypes['Trip']['Stop']['Model']>(
	{
		location: {
			lon: { type: Number, required: true },
			lat: { type: Number, required: true },
		},
		address: String,
		experience: {
			type: {
				type: String,
				enum: Object.values(ExperienceType),
			},
			data: Schema.Types.Mixed,
			score: Number,
		},
	},
	{
		_id: false,
	}
);

const RewardSchema = new Schema<TripType['reward']>(
	{
		image: String,
		title: { type: String, required: true },
	},
	{
		_id: false,
	}
);

const TripSchema = new Schema<TripType>({
	creator: { type: Schema.Types.ObjectId, ref: 'User' },
	guides: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	name: String,
	description: String,
	stops: [StopSchema],
	reward: RewardSchema,
	status: { type: String, enum: TripStatusArray, default: 'created' },
	participants: [
		new Schema(
			{
				userId: { type: Schema.Types.ObjectId, ref: 'User' },
				score: { type: Number, default: 0 },
			},
			{ _id: false, versionKey: false }
		),
	],
});

export const Trip = mongoose.model<TripType>('Trip', TripSchema);
