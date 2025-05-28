import { Router } from 'express';
import { requireDeveloper } from '../middlewares/requireDeveloper';
import { validateRequest } from '../middlewares/validatorRequest';
import { Schemas } from 'trip-track-package';
import { authenticateToken } from '../middlewares/authenticateToken';
import {
	devGetTripDebugInfo,
	devUpdateTripStatus,
	devEndTrip,
	devStartTrip,
	devResetTrip,
} from '../controllers/dev.controller';

const router = Router();

router.put(
	'/trip/reset/:id',
	authenticateToken(),
	requireDeveloper,
	validateRequest(Schemas.mongoObjectId, 'params'),
	devResetTrip
);
router.put(
	'/trip/start/:id',
	authenticateToken(),
	requireDeveloper,
	validateRequest(Schemas.mongoObjectId, 'params'),
	devStartTrip
);
router.put(
	'/trip/end/:id',
	authenticateToken(),
	requireDeveloper,
	validateRequest(Schemas.mongoObjectId, 'params'),
	devEndTrip
);
router.put(
	'/trip/status/:id/:status',
	authenticateToken(),
	requireDeveloper,
	validateRequest(Schemas.mongoObjectId, 'params'),
	devUpdateTripStatus
);

router.get(
	'/trip/debug/:id',
	authenticateToken(),
	requireDeveloper,
	validateRequest(Schemas.mongoObjectId, 'params'),
	devGetTripDebugInfo
);

export { router as devRouter };
