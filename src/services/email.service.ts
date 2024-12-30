import { EMAIL_PASS, EMAIL_USER } from '../env.config';
import sgMail, { ClientResponse } from '@sendgrid/mail';
import { AppError } from '../utils/AppError';

sgMail.setApiKey(EMAIL_PASS);

interface ISendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (
  options: ISendMailOptions
): Promise<[ClientResponse, {}]> => {
  try {
    const res = await sgMail.send({
      from: EMAIL_USER,
      ...options,
    });
    return res;
  } catch (error) {
    throw new AppError(error.name, error.message, 500, 'sgMail');
  }
};
