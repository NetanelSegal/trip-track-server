import { NextFunction, Request, Response, Router } from 'express';
import { authRouter } from './auth.route';
import { Logger } from '../utils/Logger';
import { AppError, ValidationError } from '../utils/AppError';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  Logger.info(`${req.method}:${req.originalUrl}`);
  next();
});

router.get('/health', async (req: Request, res: Response) => {
  res.send('OK');
});
router.use('/auth', authRouter);

router.use((err: AppError, req: Request, res: Response) => {
  Logger.error(err);

  res.status(500).json({ message: err.message, title: err.name });
});

export { router as indexRouter };