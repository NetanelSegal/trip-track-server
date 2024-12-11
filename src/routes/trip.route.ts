import { Router } from 'express';
import {createTrip , deleteTrip, getTrip, getTrips, updateTrip} from '../services/trip.service'

const router = Router();

router.post('/create', createTrip);
router.post('/update/:id', updateTrip);
router.get('/get/:id', getTrip);
router.get('/getAll', getTrips);
router.delete('/delete/:id', deleteTrip);

export { router as tripRouter };