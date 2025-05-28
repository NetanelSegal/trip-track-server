import { Router } from 'express';
import { requireDeveloper } from '../middlewares/requireDeveloper';
import { validateRequest } from '../middlewares/validatorRequest';
import { Schemas } from 'trip-track-package';
import { endTripMongoAndRedis, startTripMongoAndRedis } from '../services/trip.service';
import { RequestJWTPayload } from '../types';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = Router();

router.put(
	'/trip/reset/:id',
	authenticateToken(),
	requireDeveloper,
	validateRequest(Schemas.mongoObjectId, 'params'),
	async (req, res) => {
		const userId = (req as RequestJWTPayload).user._id;
		const tripId = req.params.id;
		await endTripMongoAndRedis(tripId, userId);
		await startTripMongoAndRedis(tripId, userId);
		res.json({
			success: true,
			message: 'Trip reset successfully',
		});
	}
);

export { router as devRouter };
