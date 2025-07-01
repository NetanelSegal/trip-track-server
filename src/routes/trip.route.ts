import { Router } from 'express';
import {
	getTrips,
	getTripById,
	getUserTripData,
	getAllUsersTripData,
	getTripsUserIsInParticipants,
	createTrip,
	startTrip,
	updateTrip,
	updateGuestUserNameInTrip,
	updateTripStatus,
	updateTripReward,
	addUserToTrip,
	addUserToTripParticipants,
	removeUserFromTripParticipants,
	removeUserFromTrip,
	deleteTrip,
	endTrip,
	getTripCurrentExpIndex,
	updeteGuideInTrip,
	getAllUserIdsRelatedToTrip,
} from '../controllers/trip.controller';
import { validateRequest } from '../middlewares/validatorRequest';
import { Schemas } from 'trip-track-package';
import { authenticateToken } from '../middlewares/authenticateToken';
import uploadMiddleware from '../middlewares/multerConfig';
import { parseFormData } from '../middlewares/parseFormData';
import { redisAddUserToTripSchema } from '../validationSchemas/redisTripSchemas';
import { tripUpdateStatusSchema, tripGuideSchema } from '../validationSchemas/tripSchemas';

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

router.get(
	'/users-id/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken({ allowGuest: true }),
	getAllUserIdsRelatedToTrip
);

router.get(
	'/current-exp-index/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken({ allowGuest: true }),
	getTripCurrentExpIndex
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
router.post('/start/:id', authenticateToken(), validateRequest(Schemas.mongoObjectId, 'params'), startTrip);
router.post('/end/:id', authenticateToken(), validateRequest(Schemas.mongoObjectId, 'params'), endTrip);

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
	validateRequest(Schemas.trip.updateTripSchema),
	updateTrip
);
router.put(
	'/reward/:id',
	authenticateToken(),
	uploadMiddleware.single('rewardImage'),
	parseFormData,
	validateRequest(Schemas.mongoObjectId, 'params'),
	validateRequest(Schemas.trip.reward),
	updateTripReward
);
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

router.put(
	'/remove-user-from-participants/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken(),
	removeUserFromTripParticipants
);

router.put(
	'/update-guides/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	validateRequest(tripGuideSchema, 'body'),
	authenticateToken(),
	updeteGuideInTrip
);

router.delete(
	'/user-leave/:id',
	validateRequest(Schemas.mongoObjectId, 'params'),
	authenticateToken({ allowGuest: true }),
	removeUserFromTrip
);

router.delete('/:id', validateRequest(Schemas.mongoObjectId, 'params'), authenticateToken(), deleteTrip);

export { router as tripRouter };
