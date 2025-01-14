import mongoose, { Schema, Types } from 'mongoose';
import { MissionType, StopT } from '../validationSchemas/tripSchema';
import { TripT } from '../validationSchemas/tripSchema';

const StopSchema = new mongoose.Schema<StopT>(
  {
    location: {
      lon: { type: Number, required: true },
      lat: { type: Number, required: true },
    },
    address: String,
    experience: {
      type: {
        type: String,
        enum: Object.values(MissionType),
      },
      data: Schema.Types.Mixed,
      score: Number,
    },
  },
  {
    _id: false,
  }
);

const TripSchema = new mongoose.Schema<TripT>({
  creator: Types.ObjectId,
  guides: [Types.ObjectId],
  name: String,
  description: String,
  stops: [StopSchema],
});

export const Trip = mongoose.model<TripT>('Trip', TripSchema);
