import { config } from 'dotenv';
import path from 'path';

// load environment variables based on the environment
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
config({ path: path.resolve(__dirname, envFile) });

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/trip-track';
export const REDIS_URL = process.env.REDIS_URL || '';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const JWT_SECRET = process.env.JWT_SECRET;
export const AWS_REGION = process.env.AWS_REGION ?? '';
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? '';
