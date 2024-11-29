export class AppError extends Error {
  statusCode: number;
  source: string;
  constructor(
    name: string = 'AppError',
    message: string = 'internal server error',
    statusCode = 500,
    source: string = 'unknown'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.source = source;
    this.name = name;

    Error.captureStackTrace(this, this.constructor);
  }
}
