export class AppError extends Error {
  statusCode: number;
  source: string;

  constructor(
    name: string = 'AppError',
    message: string = 'Internal server error',
    statusCode: number = 500,
    source: string = 'Unknown'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.source = source;
    this.name = name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  errorDetails: Record<string, any>;

  constructor(
    errorDetails: Record<string, any> = {},
    message: string = 'Validation failed'
  ) {
    super('InputValidationError', message, 422, 'Validation');
    this.errorDetails = errorDetails;
  }
}
