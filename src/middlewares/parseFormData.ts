import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function parseFormData(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  } catch (error) {
    next(
      new AppError(
        error.name,
        'Invalid JSON in form-data',
        500,
        'Middleware parseFormData'
      )
    );
  }
}
