import { config } from 'dotenv';

const env = process.env.NODE_ENV === 'production' ? '' : '.development';
config({ path: `.env${env}` });

export const ENV = process.env.NODE_ENV ?? 'development';
export const MONGO_URL = process.env.MONGO_URL ?? '';
export const REDIS_URL = process.env.REDIS_URL ?? '';
export const REDIS_USERNAME = process.env.REDIS_USERNAME ?? '';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? '';
export const REDIS_PORT = process.env.REDIS_PORT ?? '';
export const EMAIL_USER = process.env.EMAIL_USER ?? '';
export const EMAIL_PASS = process.env.EMAIL_PASS ?? '';
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? '';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? '';
export const GUEST_TOKEN_SECRET = process.env.GUEST_TOKEN_SECRET ?? '';
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ?? '';
export const AWS_REGION = process.env.AWS_REGION ?? '';
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? '';
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY ?? '';
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY ?? '';
export const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ?? '';
export const EMAIL_JS_PRIVATE_KEY = process.env.EMAIL_JS_PRIVATE_KEY ?? '';
export const EMAIL_JS_PUBLIC_KEY = process.env.EMAIL_JS_PUBLIC_KEY ?? '';
export const FRONT_END_MAIN_URL = process.env.FRONT_END_MAIN_URL ?? 'http://localhost:5173';
