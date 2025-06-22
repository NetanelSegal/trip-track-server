import { Router } from 'express';
import { getDirectionsRoute } from '../controllers/map.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { directionsSchema } from '../validationSchemas/mapSchemas';
import { validateRequest } from '../middlewares/validatorRequest';

const router = Router();

router.get(
	'/route',
	authenticateToken({ allowGuest: true }),
	validateRequest(directionsSchema, 'query'),
	getDirectionsRoute
);

export { router as mapRouter };
