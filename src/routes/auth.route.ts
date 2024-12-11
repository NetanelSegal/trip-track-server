import { Router } from 'express';
import {
  sendCode,
  verifyCode,
  validateToken,
} from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import {
  sendCodeSchema,
  verifyCodeSchema,
} from '../validationSchemas/authSchemas';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = Router();

router.post('/send-code', validateRequest(sendCodeSchema), sendCode);
router.post('/verify-code', validateRequest(verifyCodeSchema), verifyCode);
router.get('/validate-token', authenticateToken, validateToken);

export { router as authRouter };
