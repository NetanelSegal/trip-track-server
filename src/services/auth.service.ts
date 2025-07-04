import { EmailJSResponseStatus } from '@emailjs/nodejs';
import { AppError } from '../utils/AppError';
import { sendEmail } from './email.service';
import RedisCache from './redis.service';

export const validateCodeWithRedis = async (email: string, code: string): Promise<boolean> => {
	const redisResult = await RedisCache.getValueByKey<string>(email);

	if (!redisResult) {
		throw new AppError('AppError', "code doesn't exist", 500, 'Redis');
	}

	const { code: redisCode } = JSON.parse(redisResult);

	if (redisCode !== code) {
		throw new AppError('AppError', 'wrong code', 401, 'Redis');
	}

	return true;
};

export const sendEmailWithCodeToUser = async (email: string, code: string): Promise<EmailJSResponseStatus> => {
	try {
		const sendEmailres = await sendEmail({
			to: email,
			code,
		});

		return sendEmailres;
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.status || 500, 'sendEmail');
	}
};

export const saveUserDataInRedis = async (
	email: string,
	code: string,
	expirationTimeMinutes: number
): Promise<void> => {
	try {
		await RedisCache.setKeyWithValue({
			key: email,
			value: JSON.stringify({ code }),
			expirationTime: 60 * expirationTimeMinutes,
		});
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError(error.name, error.message, error.status || 500, 'Redis');
	}
};
