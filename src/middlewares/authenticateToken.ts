import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { generateAccessToken, verifyToken } from '../utils/jwt.utils';
import { RequestJWTPayload } from '../types';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../env.config';
import { Logger } from '../utils/Logger';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken) {
      const user = verifyToken(accessToken, ACCESS_TOKEN_SECRET);
      Logger.info(`Access token is valid for email user ${user.email}`);

      if (user) {
        (req as RequestJWTPayload).user = user;
        return next();
      }
    }

    if (refreshToken) {
      const refreshUser = verifyToken(refreshToken, REFRESH_TOKEN_SECRET);

      if (refreshUser) {
        Logger.info(
          `Refresh token is valid for email user ${refreshUser.email} generating new access token`
        );
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
    }

    throw new AppError(
      'AppError',
      'Invalid or expired tokens',
      401,
      'authenticateToken'
    );
  } catch (error) {
    next(error);
  }
};
