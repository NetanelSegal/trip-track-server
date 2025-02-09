import { Types } from 'trip-track-package';
import { Trip } from '../models/trip.model';
import { AppError } from '../utils/AppError';
import RedisCache from './redis.service';

interface IRedisUserTripData {
  score: number[];
  finishedExperiences: boolean[];
}

interface IRedisTripExperience {
  winners: [number, number, number];
  active: boolean;
}

interface TripService {
  // mongo related functions
  mongoCreateTrip: (
    data: Types['Trip']['Model']
  ) => Promise<Types['Trip']['Model']>;
  mongoUpdateTrip: (
    userId: string,
    tripId: string,
    data: Types['Trip']['Model']
  ) => Promise<Types['Trip']['Model']>;
  mongoGetTripById: (id: string) => Promise<Types['Trip']['Model']>;
  mongoGetTrips: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<Types['Trip']['Model'][]>;
  mongoDeleteTrip: (userId: string, tripId: string) => Promise<void>;

  // redis related functions
  redisAddUserToTrip: (
    tripId: string,
    userId: string
  ) => Promise<IRedisUserTripData>;
  redisRemoveUserFromTrip: (tripId: string, userId: string) => Promise<boolean>;
  redisUpdateUserTripData: (
    tripId: string,
    userId: string,
    data: { score: number[]; finishedExperiences: boolean[] }
  ) => Promise<IRedisUserTripData>;
  redisUpdateTripExperiences: (
    tripId: string,
    data: { winners: [string, string, string]; active: boolean }[]
  ) => Promise<void>;
  redisGetLeaderboard: (tripId: string) => Promise<
    {
      score: number;
      value: string;
    }[]
  >;
  redisInitializeTripExperiences: (
    tripId: string,
    countOfExperiences: number
  ) => Promise<void>;
}

// mongo
export const mongoCreateTrip: TripService['mongoCreateTrip'] = async (data) => {
  try {
    const trip = await Trip.create(data);
    return trip;
  } catch (error) {
    throw new AppError(error.name, error.message, 500, 'MongoDB');
  }
};

export const mongoUpdateTrip: TripService['mongoUpdateTrip'] = async (
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

export const mongoGetTripById: TripService['mongoGetTripById'] = async (
  tripId
) => {
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
export const mongoGetTrips: TripService['mongoGetTrips'] = async (
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

export const mongoDeleteTrip: TripService['mongoDeleteTrip'] = async (
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

// redis
export const redisAddUserToTrip: TripService['redisAddUserToTrip'] = async (
  tripId,
  userId
) => {
  const userKey = `trip_user:${tripId}:${userId}`;
  const leaderboardKey = `trip_leaderboard:${tripId}`;

  const userTripData: IRedisUserTripData = {
    score: [],
    finishedExperiences: [],
  };

  await RedisCache.setKeyWithValue({
    key: userKey,
    value: userTripData,
    expirationTime: 60 * 60 * 24,
  });

  await RedisCache.addToSortedSet(leaderboardKey, { score: 0, value: userId });

  return userTripData;
};

export const redisRemoveUserFromTrip: TripService['redisRemoveUserFromTrip'] =
  async (tripId, userId) => {
    const userKey = `trip_user:${tripId}:${userId}`;
    const leaderboardKey = `trip_leaderboard:${tripId}`;

    await RedisCache.deleteKey(userKey);
    await RedisCache.removeFromSortedSet(leaderboardKey, userId);
    return true;
  };

export const redisUpdateUserTripData: TripService['redisUpdateUserTripData'] =
  async (tripId, userId, data) => {
    const userKey = `trip_user:${tripId}:${userId}`;
    const user = await RedisCache.getValueByKey(userKey);

    if (!user) {
      throw new AppError('NotFount', 'User not found', 404, 'Redis');
    }

    await RedisCache.setKeyWithValue({
      key: userKey,
      value: data,
      expirationTime: 60 * 60 * 24,
    });

    const leaderboardKey = `trip_leaderboard:${tripId}`;

    const newTotalScore = data.score.reduce((a, b) => a + b, 0);
    await RedisCache.addToSortedSet(leaderboardKey, {
      score: newTotalScore,
      value: userId,
    });

    return data;
  };

export const redisGetLeaderboard: TripService['redisGetLeaderboard'] = async (
  tripId
) => {
  const leaderboardKey = `trip_leaderboard:${tripId}`;
  const leaderboard = await RedisCache.getMembersFromSortedSet(leaderboardKey);
  return leaderboard;
};

export const redisInitializeTripExperiences: TripService['redisInitializeTripExperiences'] =
  async (tripId, countOfExperiences) => {
    const tripExperiencesKey = `trip_experiences:${tripId}`;
    const tripExperiences: IRedisTripExperience[] = Array.from(
      { length: countOfExperiences },
      (_) => ({
        winners: [-1, -1, -1],
        active: false,
      })
    );
    await RedisCache.setKeyWithValue({
      key: tripExperiencesKey,
      value: tripExperiences,
      expirationTime: 60 * 60 * 24,
    });
  };
