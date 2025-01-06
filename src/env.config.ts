import { config } from 'dotenv';
config();

export const ENV = process.env.NODE_ENV || 'development';
export const MONGO_URL = process.env.MONGO_URL || '';
export const REDIS_URL = process.env.REDIS_URL || '';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const JWT_SECRET = process.env.JWT_SECRET;
