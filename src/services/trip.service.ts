import { Types } from 'trip-track-package';
import { Trip } from '../models/trip.model';
import { AppError } from '../utils/AppError';

export const mongoCreateTrip = async (
  data: Types['Trip']['Model']
): Promise<Types['Trip']['Model']> => {
  try {
    const trip = await Trip.create(data);
    return trip;
  } catch (error) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};

export const mongoUpdateTrip = async ({
  id,
  data,
}: {
  id: string;
  data: Types['Trip']['Model'];
}): Promise<Types['Trip']['Model']> => {
  try {
    const updatedTrip = await Trip.findByIdAndUpdate(id, data, { new: true });
    if (!updatedTrip) {
      throw new AppError('Trip not found', 'Trip not found', 404, 'MongoDB');
    }
    return updatedTrip;
  } catch (error: any) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};

export const mongoGetTripById = async (
  id: string
): Promise<Types['Trip']['Model']> => {
  try {
    const trip = await Trip.findById(id);
    return trip;
  } catch (error: any) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};
export const mongoGetTrips = async ({
  id,
  page = 1,
  limit = 10,
}: {
  id: string;
  page: number;
  limit: number;
}): Promise<Types['Trip']['Model'][]> => {
  try {
    const skip = (page - 1) * limit;
    const trips = await Trip.find({ creator: id }).skip(skip).limit(limit);
    return trips;
  } catch (error: any) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};

export const mongoDeleteTrip = async (id: string): Promise<void> => {
  try {
    const trip = await Trip.findByIdAndDelete(id);
  } catch (error: any) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};
