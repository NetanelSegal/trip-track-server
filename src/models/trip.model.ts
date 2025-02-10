import mongoose, { Schema, Types } from 'mongoose';
import { ExperienceType, Types as TTTypes, TripStatusArray } from 'trip-track-package';

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

const RewardSchema = new Schema<TTTypes['Trip']['Reward']['Model']>(
	{
		image: String,
		title: { type: String, required: true },
	},
	{
		_id: false,
	}
);

const TripSchema = new Schema<TTTypes['Trip']['Model']>({
	creator: Types.ObjectId,
	guides: [Types.ObjectId],
	name: String,
	description: String,
	stops: [StopSchema],
	reward: RewardSchema,
	status: { type: String, enum: TripStatusArray, default: 'created' },
});

export const Trip = mongoose.model<TTTypes['Trip']['Model']>('Trip', TripSchema);
