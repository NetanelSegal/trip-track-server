import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { generateAccessToken, verifyToken } from '../utils/jwt.utils';
import { RequestJWTPayload } from '../types';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../env.config';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    throw new AppError(
      'AppError',
      'Access token is missing',
      401,
      'authenticateToken'
    );
  }

  const user = verifyToken(accessToken, ACCESS_TOKEN_SECRET);

  if (user) {
    (req as RequestJWTPayload).user = user;
    return next();
  }

  if (!refreshToken) {
    throw new AppError(
      'AppError',
      'Refresh token is missing',
      401,
      'authenticateToken'
    );
  }

  const refreshUser = verifyToken(refreshToken, REFRESH_TOKEN_SECRET);

  if (refreshUser) {
    const newAccessToken = generateAccessToken({
      _id: refreshUser._id,
      email: refreshUser.email,
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    (req as RequestJWTPayload).user = refreshUser;
    return next();
  }

  // Both tokens are invalid
  throw new AppError(
    'AppError',
    'Invalid or expired tokens',
    401,
    'authenticateToken'
  );
};
