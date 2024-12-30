import mongoose, { Schema , Types} from 'mongoose';
import { MissionType } from '../validationSchemas/tripSchema';
import { TripT } from '../validationSchemas/tripSchema';

const StopSchema = new mongoose.Schema(
  {
    location: { lon: Number, lat: Number },
    address: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      zip: { type: String, required: false },
    },
    mission: {
      type: {
        type: String,
        enum: Object.values(MissionType),
      },
      data: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  }
);

const TripSchema = new mongoose.Schema({
  creator: Types.ObjectId,
  guides: [Types.ObjectId],
  name: String,
  description: String,
  stops: [StopSchema],
});

export const Trip = mongoose.model<TripT>('Trip', TripSchema);
