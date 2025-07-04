import { AppError } from '../utils/AppError';
import emailjs, { EmailJSResponseStatus } from '@emailjs/nodejs';
import { EMAIL_JS_PRIVATE_KEY, EMAIL_JS_PUBLIC_KEY } from '../env.config';

emailjs.init({
	privateKey: EMAIL_JS_PRIVATE_KEY,
	publicKey: EMAIL_JS_PUBLIC_KEY,
});

interface ISendMailOptions {
	to: string;
	code: string;
}

export const sendEmail = async ({ to, code }: ISendMailOptions): Promise<EmailJSResponseStatus> => {
	try {
		const templateParams = {
			email: to,
			code,
		};

		const res = await emailjs.send('service_ty0viwh', 'template_mc4enbd', templateParams);

		return res;
	} catch (error) {
		throw new AppError(error.name, error.message, error.status, 'emailjs');
	}
};
