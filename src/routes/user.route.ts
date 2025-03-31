import { Router } from 'express';
import { getUserProfile, updateUserProfile, getRandomUserName, logout } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { authenticateToken } from '../middlewares/authenticateToken';
import { Schemas } from 'trip-track-package';

const router = Router();

router.get('/random-name', getRandomUserName);

router.get('/:userId', getUserProfile);
router.put('/profile', authenticateToken(), validateRequest(Schemas.user), updateUserProfile);
router.post('/logout', authenticateToken({ allowGuest: true }), logout);
export { router as userRouter };
