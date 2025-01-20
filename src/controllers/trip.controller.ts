import { Request, Response, NextFunction } from 'express';
import {
  mongoCreateTrip,
  mongoDeleteTrip,
  mongoGetTripById,
  mongoGetTrips,
  mongoUpdateTrip,
} from '../services/trip.service';
import { RequestJWTPayload } from '../types';

export const createTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trip = await mongoCreateTrip({
      ...req.body,
      creator: (req as RequestJWTPayload).user._id,
    });
    res.json(trip);
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await mongoDeleteTrip((req as RequestJWTPayload).user._id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trip = await mongoGetTripById(req.params.id);
    res.json(trip);
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = req.query;
    const trips = await mongoGetTrips({
      id: (req as RequestJWTPayload).user._id,
      page: +page,
      limit: +limit,
    });
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trip = await mongoUpdateTrip({
      id: req.params.id,
      data: req.body,
    });
    res.json(trip);
  } catch (error) {
    next(error);
  }
};
