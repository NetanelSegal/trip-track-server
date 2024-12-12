import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt.utils';
import { CustomRequest } from '../types';

export const authenticateToken = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token)
    throw new AppError(
      'AppError',
      'Token is missing',
      401,
      'authenticateToken'
    );

  try {
    const payload = verifyToken(token);

    (req as CustomRequest).user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
