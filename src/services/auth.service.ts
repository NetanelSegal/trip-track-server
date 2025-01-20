import { ClientResponse } from '@sendgrid/mail';
import { AppError } from '../utils/AppError';
import { readFile } from '../utils/functions.utils';
import { sendEmail } from './email.service';
import RedisCache from './redis.service';
import path from 'path';

export const validateCodeWithRedis = async (
  email: string,
  code: string
): Promise<boolean> => {
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

export const sendEmailWithCodeToUser = async (
  email: string,
  code: string
): Promise<ClientResponse> => {
  try {
    const pathToFile = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'verify-code.html'
    );

    const html = (await readFile(pathToFile)).replace('**XXXXXX**', code);

    const sendEmailres = await sendEmail({
      to: email,
      subject: 'test',
      text: `your verification code is ${code}`,
      html: html,
    });

    return sendEmailres[0];
  } catch (error) {
    throw new AppError(error.name, error.message, 500, 'sendEmail');
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
    throw new AppError(error.name, error.message, 500, 'Redis');
  }
};
