import { Router } from 'express';
import {
	sendCode,
	verifyCode,
	validateToken,
	createGuestToken,
	generateUserTokens,
} from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { authenticateToken } from '../middlewares/authenticateToken';
import { Schemas } from 'trip-track-package';

const router = Router();

router.post('/send-code', validateRequest(Schemas.auth.sendCodeSchema), sendCode);
router.post('/verify-code', validateRequest(Schemas.auth.verifyCodeSchema), verifyCode);
router.get('/create-user-tokens', authenticateToken(), generateUserTokens);
router.get('/create-guest-token', createGuestToken);
router.get('/validate-token', authenticateToken({ allowGuest: true }), validateToken);

export { router as authRouter };
