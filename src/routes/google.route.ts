import { Router } from 'express';
import { getAddressSuggestions } from '../controllers/google.controller';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = Router();

// GET /address-suggestions?query=<query>
router.get('/address-suggestions', authenticateToken, getAddressSuggestions);

export { router as googleRouter };
