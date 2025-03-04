import { Router } from 'express';
import { validateRequest } from '../middlewares/validatorRequest';
import { authenticateToken } from '../middlewares/authenticateToken';
import { getRelatedTripsByUserId, removeTripRelated, deleteAllTripsRelated } from '../controllers/trip.controller';

const router = Router();

router.get('/getTripsByUserId', authenticateToken(), getRelatedTripsByUserId);
router.put('/remove/:id', authenticateToken(), removeTripRelated);
router.delete('/delete', authenticateToken(), deleteAllTripsRelated);

export { router as tripsRelatedRouter };
