import { NextFunction, Request, Response } from 'express';
import { generateRandomDigitsCode } from '../utils/functions.utils';
import { userGetOrCreateMongo } from '../services/user.service';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { RequestJWTPayload } from '../types';
import {
  saveUserDataInRedis,
  sendEmailWithCodeToUser,
  validateCodeWithRedis,
} from '../services/auth.service';
import { ENV } from '../env.config';
import { Types } from 'trip-track-package';

const REDIS_EXP_TIME_MIN = 10;

export const sendCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body as Types['Auth']['SendCode'];

    const code = generateRandomDigitsCode(6);

    await saveUserDataInRedis(email, code, REDIS_EXP_TIME_MIN);

    if (ENV !== 'development') {
      await sendEmailWithCodeToUser(email, code);
    }

    res.status(202).json({
      message: `code sent successfully and will expire in ${REDIS_EXP_TIME_MIN} minutes`,
      ...(ENV === 'development' ? { code } : {}),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code } = req.body as Types['Auth']['VerifyCode'];

    await validateCodeWithRedis(email, code);

    const { user, isNew } = await userGetOrCreateMongo(email);

    // Generate tokens
    const accessToken = generateAccessToken({
      _id: user._id.toString(),
      email,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      email,
    });

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ user, isNewUser: isNew });
  } catch (error) {
    next(error);
  }
};

export const validateToken = async (req: Request, res: Response) => {
  res.status(200).json((req as RequestJWTPayload).user);
};
