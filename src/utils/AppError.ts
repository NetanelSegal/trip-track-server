export class AppError extends Error {
  statusCode: number;
  errorFrom: string;
  constructor(
    message: string,
    statusCode = 400,
    errorFrom: string = 'Not found'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorFrom = errorFrom;
    this.name = 'AppError';

    Error.captureStackTrace(this, this.constructor);
  }
}
