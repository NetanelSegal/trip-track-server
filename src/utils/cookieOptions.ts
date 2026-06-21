import { CookieOptions } from 'express';
import { ENV } from '../env.config';

export const getAuthCookieOptions = (maxAge: number): CookieOptions => ({
	httpOnly: true,
	secure: ENV === 'production',
	sameSite: ENV === 'production' ? 'none' : 'lax',
	maxAge,
});

export const getClearAuthCookieOptions = (): CookieOptions => ({
	httpOnly: true,
	secure: ENV === 'production',
	sameSite: ENV === 'production' ? 'none' : 'lax',
});

export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
export const GUEST_TOKEN_MAX_AGE = 15 * 60 * 60 * 1000;
