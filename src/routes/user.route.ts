import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { userUpdateSchema } from '../validationSchemas/userSchemas';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = Router();

router.get('/:userId', getUserProfile);
router.put(
  '/profile',
  authenticateToken,
  validateRequest(userUpdateSchema),
  updateUserProfile
);

export { router as userRouter };
