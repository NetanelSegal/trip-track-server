import jwt, { JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, GUEST_TOKEN_SECRET } from '../env.config';
import { Payload } from '../types';

/**
 * Generates an access token from a payload, valid for 15 minutes.
 * @param payload - The payload to encode in the JWT token.
 * @returns The generated access token.
 */
export const generateAccessToken = (payload: Payload) => {
	return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

/**
 * Generates a refresh token from a payload, valid for 7 days.
 * @param payload - The payload to encode in the JWT token.
 * @returns The generated refresh token.
 */
export const generateRefreshToken = (payload: Payload) => {
	return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const generateGuestToken = (payload: Payload) => {
	return jwt.sign(payload, GUEST_TOKEN_SECRET, { expiresIn: '7d' });
};

/**
 * Verifies a JWT token using the appropriate secret.
 * @param token - The JWT token to verify.
 * @param secret - The secret key to verify the token against.
 * @returns The decoded payload or null if verification fails.
 */

export const verifyToken = (token: string, secret: string): Payload | null => {
	try {
		const { exp, iat, ...payload } = jwt.verify(token, secret) as JwtPayload & Payload;
		return payload;
	} catch (error) {
		console.error('Token verification failed:', error.message);
		return null;
	}
};
