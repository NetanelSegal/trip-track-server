import { Router } from 'express';
import { sendCode, verifyCode } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import {
  sendCodeSchema,
  verifyCodeSchema,
} from '../validationSchemas/authSchemas';

const router = Router();

router.post('/send-code', validateRequest(sendCodeSchema), sendCode);
router.post('/verify-code', validateRequest(verifyCodeSchema), verifyCode);

export { router as authRouter };
