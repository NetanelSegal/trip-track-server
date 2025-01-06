import { NextFunction, Request, Response } from 'express';
import { generateRandomDigitsCode, readFile } from '../utils/functions.utils';
import { userGetOrCreateMongo } from '../services/user.service';
import { generateToken } from '../utils/jwt.utils';
import { CustomRequest } from '../types';
import {
  SendCodeSchema,
  VerifyCodeSchema,
} from '../validationSchemas/authSchemas';
import {
  saveUserDataInRedis,
  sendEmailWithCodeToUser,
  validateCodeWithRedis,
} from '../services/auth.service';
import { ENV } from '../env.config';

const REDIS_EXP_TIME_MIN = 10;

console.log(ENV);

export const sendCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body as SendCodeSchema;

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
    const { email, name, code } = req.body as VerifyCodeSchema;

    await validateCodeWithRedis(email, code);

    const user = await userGetOrCreateMongo({
      email,
      name,
    });

    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({ user });
  } catch (error) {
    next(error);
  }
};

export const validateToken = async (req: Request, res: Response) => {
  res.status(200).json((req as CustomRequest).user);
};
