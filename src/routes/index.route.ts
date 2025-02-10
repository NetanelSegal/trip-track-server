import { NextFunction, Request, Response, Router } from 'express';
import { authRouter } from './auth.route';
import { Logger } from '../utils/Logger';
import { AppError, ValidationError } from '../utils/AppError';
import { tripRouter } from './trip.route';
import { ENV } from '../env.config';
import { googleRouter } from './google.route';
import { userRouter } from './user.route';
import { uploadRouter } from './upload.route';

const router = Router();

router.use((req: Request, _: Response, next: NextFunction) => {
	Logger.info(`${req.method}:${req.originalUrl}`);
	next();
});

router.get('/health', async (_: Request, res: Response) => {
	res.send('OK');
});

router.use('/google', googleRouter);
router.use('/auth', authRouter);
router.use('/trip', tripRouter);
router.use('/user', userRouter);
router.use('/upload', uploadRouter);

router.use((err: AppError, _: Request, res: Response, _next: NextFunction) => {
	Logger.error(err);

	let o: Record<string, any> = {};
	if (ENV === 'development' && err instanceof ValidationError) {
		o.errorDetails = err.errorDetails;
	}

	res.status(err.statusCode || 500).json({
		message: ENV === 'development' ? err.message : 'Internal server error',
		title: err.name,
		...o,
	});
});

export { router as indexRouter };
