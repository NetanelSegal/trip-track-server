import { RequestHandler } from "express";
import { createTripSchema } from "../validations/trip.validations";
import { Trip } from "../models/trip.model";
import { AppError } from "../utils/AppError";

export const createTrip: RequestHandler = async (req, res, next) => {
  try {
    const response = createTripSchema.safeParse(req.body);
    if (!response.success) {
      res.status(400).json({ error: response.error.format() });
      return; 
    }
    const trip = await Trip.create(response.data);
    res.json(trip); 
  } catch (error: any) {
    next(new AppError(error.name, error.message, 500, "MongoDB"));
  }
};

export const updateTrip: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const response = createTripSchema.safeParse(updates);
    if (!response.success) {
      res.status(400).json({ error: response.error.format() });
      return;
    }
    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedTrip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    res.json(updatedTrip);
  } catch (error: any) {
    next(new AppError(error.name, error.message, 500, "MongoDB"));
  }
};



export const getTrips: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const trips = await Trip.find({creator: req.body.id})
      .skip(skip)
      .limit(Number(limit));
    res.json(trips);
  } catch (error: any) {
    next(new AppError(error.name, error.message, 500, "MongoDB"));
  }
};


export const getTrip: RequestHandler = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }
    res.json(trip);
  } catch (error: any) {
    next(new AppError(error.name, error.message, 500, "MongoDB"));
  }
};

export const deleteTrip: RequestHandler = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }
    res.json(trip);
  } catch (error: any) {
    next(new AppError(error.name, error.message, 500, "MongoDB"));
  }
};