import { Types } from 'trip-track-package';
import { Trip } from '../models/trip.model';
import { AppError } from '../utils/AppError';

interface TripService {
  createTrip: (data: Types['Trip']['Model']) => Promise<Types['Trip']['Model']>;
  updateTrip: (
    userId: string,
    tripId: string,
    data: Types['Trip']['Model']
  ) => Promise<Types['Trip']['Model']>;
  getTripById: (id: string) => Promise<Types['Trip']['Model']>;
  getTrips: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<Types['Trip']['Model'][]>;
  deleteTrip: (userId: string, tripId: string) => Promise<void>;
}

export const mongoCreateTrip: TripService['createTrip'] = async (data) => {
  try {
    const trip = await Trip.create(data);
    return trip;
  } catch (error) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};

export const mongoUpdateTrip: TripService['updateTrip'] = async (
  userId,
  tripId,
  data
) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('NotFound', 'Trip not found', 404, 'MongoDB');
    }

    if (trip.creator.toString() !== userId) {
      throw new AppError(
        'Unauthorized',
        'You are not authorized to update this trip',
        403,
        'MongoDB'
      );
    }

    if ((await trip.updateOne(data)).modifiedCount === 0) {
      throw new AppError(
        'InternalError',
        'Error updating trip',
        500,
        'MongoDB'
      );
    }

    return trip;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.name,
      error.message,
      error.statusCode || 500,
      'MongoDB'
    );
  }
};

export const mongoGetTripById: TripService['getTripById'] = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 'Trip not found', 404, 'MongoDB');
    }
    return trip;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.name,
      error.message,
      error.statusCode || 500,
      'MongoDB'
    );
  }
};
export const mongoGetTrips: TripService['getTrips'] = async (
  userId,
  page = 1,
  limit = 10
) => {
  try {
    const skip = (page - 1) * limit;
    const trips = await Trip.find({ creator: userId }).skip(skip).limit(limit);
    if (!trips) {
      throw new AppError('Trips not found', 'Trips not found', 404, 'MongoDB');
    }
    return trips;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.name,
      error.message,
      error.statusCode || 500,
      'MongoDB'
    );
  }
};

export const mongoDeleteTrip: TripService['deleteTrip'] = async (
  userId,
  tripId
) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw new AppError('NotFount', 'Trip not found', 404, 'MongoDB');
    }

    if (trip.creator.toString() !== userId) {
      throw new AppError(
        'Unauthorized',
        'You are not authorized to delete this trip',
        403,
        'MongoDB'
      );
    }

    if ((await trip.deleteOne()).deletedCount === 0) {
      throw new AppError(
        'InternalError',
        'Error deleting trip',
        500,
        'MongoDB'
      );
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.name,
      error.message,
      error.statusCode || 500,
      'MongoDB'
    );
  }
};
