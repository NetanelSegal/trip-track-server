import mongoose, { Schema, Types } from 'mongoose';
import { ExperienceType, Types as TTTypes } from 'trip-track-package';

const StopSchema = new mongoose.Schema<TTTypes['Trip']['Stop']['Model']>(
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

const TripSchema = new mongoose.Schema<TTTypes['Trip']['Model']>({
  creator: Types.ObjectId,
  guides: [Types.ObjectId],
  name: String,
  description: String,
  stops: [StopSchema],
});

export const Trip = mongoose.model<TTTypes['Trip']['Model']>(
  'Trip',
  TripSchema
);
