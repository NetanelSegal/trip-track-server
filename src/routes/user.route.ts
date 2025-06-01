import { Router } from 'express';
import {
	getUserProfile,
	updateUserProfile,
	getRandomUserName,
	logout,
	updateProfileImage,
} from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { authenticateToken } from '../middlewares/authenticateToken';
import { Schemas } from 'trip-track-package';
import uploadMiddleware from '../middlewares/multerConfig';

const router = Router();

router.get('/random-name', getRandomUserName);

router.get('/:userId', getUserProfile);
router.put('/profile', authenticateToken(), validateRequest(Schemas.user), updateUserProfile);
router.put('/profile-image', authenticateToken(), uploadMiddleware.single('profileImage'), updateProfileImage);
router.post('/logout', authenticateToken({ allowGuest: true }), logout);
export { router as userRouter };
