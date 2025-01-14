import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/AppError';
import { Request } from 'express';
import { NextFunction, Response } from 'express-serve-static-core';
import { getErrorsFromIssues } from '../utils/zod.utils';

export function validateRequest<T>(
  schema: ZodSchema<T>,
  keyToValidate: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req[keyToValidate]);

    if (!parseResult.success) {
      const errorObject = getErrorsFromIssues(parseResult.error.issues);

      next(new ValidationError(errorObject, 'Validation failed'));
      return;
    }

    next();
  };
}
