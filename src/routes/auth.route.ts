import { Router } from 'express';
import {
  sendCode,
  verifyCode,
  validateToken,
} from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { authenticateToken } from '../middlewares/authenticateToken';
import { Schemas } from 'trip-track-package';

const router = Router();

router.post(
  '/send-code',
  validateRequest(Schemas.auth.sendCodeSchema),
  sendCode
);
router.post(
  '/verify-code',
  validateRequest(Schemas.auth.verifyCodeSchema),
  verifyCode
);
router.get('/validate-token', authenticateToken, validateToken);

export { router as authRouter };
