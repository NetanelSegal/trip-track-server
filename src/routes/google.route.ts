import { Router } from 'express';
import { getAddressSuggestions, getGeocodeForAddress } from '../controllers/google.controller';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = Router();

// GET /address-suggestions?query=<query>
router.get('/address-suggestions', authenticateToken(), getAddressSuggestions);
router.get('/geocode', authenticateToken(), getGeocodeForAddress);

export { router as googleRouter };
