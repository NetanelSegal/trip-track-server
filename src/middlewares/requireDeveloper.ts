import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { RequestJWTPayload } from '../types';

export const requireDeveloper = (req: Request, _: Response, next: NextFunction) => {
	const { user } = req as RequestJWTPayload;

	if (!user || user.role !== 'developer') {
		return next(new AppError('Forbidden', 'Developer access required', 403, 'requireDeveloper'));
	}
	next();
};
