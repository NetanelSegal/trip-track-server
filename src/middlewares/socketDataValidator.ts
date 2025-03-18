import { ClientToServerEvents, SocketType } from '../types/socket';
import { ZodSchema } from 'zod';
import { AppError, ValidationError } from '../utils/AppError';
import { getErrorsFromIssues } from '../utils/zod.utils';

export function socketDataValidator(socket: SocketType, eventName: keyof ClientToServerEvents, schema: ZodSchema): void;

export function socketDataValidator(
	socket: SocketType,
	eventName: keyof ClientToServerEvents,
	schemas: ZodSchema[]
): void;

export function socketDataValidator(
	socket: SocketType,
	eventName: keyof ClientToServerEvents,
	schemas: ZodSchema | ZodSchema[]
) {
	socket.use(([event, ...data], next) => {
		if (eventName !== event) {
			return next();
		}

		let validationError: ValidationError | null = null;

		if (Array.isArray(schemas)) {
			if (data.length !== schemas.length) {
				throw new AppError(
					'AppError',
					`Data length does not match schemas length in socketDataValidator in ${eventName}`,
					400,
					'socketDataValidator'
				);
			}

			data.forEach((item, index) => {
				const schema = schemas[index];
				const parseResult = schema.safeParse(item);

				if (!parseResult.success) {
					if (!validationError) {
						validationError = new ValidationError({}, `Validation failed in event: ${event}`);
					}
					const errorObject = getErrorsFromIssues(parseResult.error.issues);
					validationError.errorDetails[index] = errorObject;
				}
			});
		} else {
			const parseResult = schemas.safeParse(data[0]);
			if (!parseResult.success) {
				const errorObject = getErrorsFromIssues(parseResult.error.issues);
				validationError = new ValidationError(errorObject, `Validation failed in event: ${event}`);
			}
		}

		if (validationError) {
			next(validationError);
			return;
		}

		next();
	});
}
