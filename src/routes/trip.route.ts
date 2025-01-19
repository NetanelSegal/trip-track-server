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

const router = Router();

router.post(
  '/create',
  authenticateToken,
  validateRequest(Schemas.trip.createTripSchema),
  createTrip
);

router.put(
  '/update/:id',
  authenticateToken,
  validateRequest(Schemas.trip.createTripSchema),
  updateTrip
);

router.get('/get/:id', authenticateToken, getTripById);
router.get('/getAll', authenticateToken, getTrips);
router.delete('/delete/:id', authenticateToken, deleteTrip);

export { router as tripRouter };
