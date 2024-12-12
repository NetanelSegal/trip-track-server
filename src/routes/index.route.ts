import { NextFunction, Request, Response, Router } from 'express';
import { authRouter } from './auth.route';
import { Logger } from '../utils/Logger';
import { AppError } from '../utils/AppError';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  Logger.info(`${req.method}:${req.originalUrl}`);
  next();
});

router.get('/health', async (req: Request, res: Response) => {
  res.send('OK');
});
router.use('/auth', authRouter);

router.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  Logger.error(err);
  res.status(err.statusCode || 500).json({
    error: `Error: ${err.message}, Source: ${err.source}, Status code: ${err.statusCode}`,
  });
});

export { router as indexRouter };
