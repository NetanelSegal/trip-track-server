import { Router } from 'express';
import {
	createTrip,
	deleteTrip,
	getTrips,
	updateTrip,
	getTripById,
	addUserToTrip,
	removeUserFromTrip,
	updateGuestUserNameInTrip,
	getUserTripData,
	getAllUsersTripData,
	updateTripStatus,
	addUserToTripParticipants,
	getTripsUserIsInParticipants,
} from '../controllers/trip.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { Schemas } from 'trip-track-package';
import { authenticateToken } from '../middlewares/authenticateToken';
import uploadMiddleware from '../middlewares/multerConfig';
import { parseFormData } from '../middlewares/parseFormData';
import { redisAddUserToTripSchema } from '../validationSchemas/redisTripSchemas';
import { tripUpdateStatusSchema } from '../validationSchemas/tripSchemas';

const router = Router();

router.get('/getAll', authenticateToken(), getTrips);
router.get('/user-in-participants', authenticateToken(), getTripsUserIsInParticipants);

router.get('/:id', validateRequest(Schemas.mongoObjectId, 'params'), getTripById);
router.get(
	'/:id/user',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken({ allowGuest: true }),
	getUserTripData
);
router.get(
	'/:id/users',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken({ allowGuest: true }),
	getAllUsersTripData
);

router.post(
	'/user-join/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	validateRequest(redisAddUserToTripSchema),
	authenticateToken({ allowGuest: true }),
	addUserToTrip
);
router.post(
	'/create',
	authenticateToken(),
	uploadMiddleware.single('rewardImage'),
	parseFormData,
	validateRequest(Schemas.trip.createTripSchema),
	createTrip
);

router.put(
	'/:id/guest-name',
	authenticateToken({ allowGuest: true }),
	validateRequest(redisAddUserToTripSchema),
	updateGuestUserNameInTrip
);
router.put(
	'/:id',
	authenticateToken(),
	validateRequest(Schemas.mongoObjectId, 'params'),
	validateRequest(Schemas.trip.createTripSchema),
	updateTrip
);

router.delete(
	'/user-leave/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken({ allowGuest: true }),
	removeUserFromTrip
);

router.delete('/:id', validateRequest(Schemas.mongoObjectId, 'params'), authenticateToken(), deleteTrip);

router.put(
	'/status/:id',
	authenticateToken(),
	validateRequest(Schemas.mongoObjectId, 'params'),
	validateRequest(tripUpdateStatusSchema, 'body'),
	updateTripStatus
);

router.put(
	'/user-to-participants/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken(),
	addUserToTripParticipants
);

export { router as tripRouter };
