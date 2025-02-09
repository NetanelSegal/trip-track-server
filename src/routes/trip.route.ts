import { Router } from 'express';
import {
  createTrip,
  deleteTrip,
  getTrips,
  updateTrip,
  getTripById,
} from '../controllers/trip.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { Schemas } from 'trip-track-package';
import { authenticateToken } from '../middlewares/authenticateToken';
import uploadMiddleware from '../middlewares/multerConfig';
import { parseFormData } from '../middlewares/parseFormData';

const router = Router();

router.get('/getAll', authenticateToken, getTrips);
router.get(
  '/:id',
  validateRequest(Schemas.mongoObjectId, 'params'),
  authenticateToken,
  getTripById
);

router.post(
  '/create',
  authenticateToken,
  uploadMiddleware.single('rewardImage'),
  parseFormData,
  validateRequest(Schemas.trip.createTripSchema),
  createTrip
);

router.put(
  '/:id',
  authenticateToken,
  validateRequest(Schemas.mongoObjectId, 'params'),
  validateRequest(Schemas.trip.createTripSchema),
  updateTrip
);

router.delete(
  '/:id',
  validateRequest(Schemas.mongoObjectId, 'params'),
  authenticateToken,
  deleteTrip
);

export { router as tripRouter };
