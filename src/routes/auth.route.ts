import { Router } from 'express';
import { sendCode, verifyCode } from '../controllers/auth.controller';

const router = Router();

router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);

export { router as authRouter };
