import { config } from 'dotenv';
config();

export const ENV = process.env.NODE_ENV || 'development';
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/trip-track';
