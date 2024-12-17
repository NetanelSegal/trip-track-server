import { Router } from "express";
import {
  createTrip,
  deleteTrip,
  getTrips,
  updateTrip,
  getTripById,
} from "../controllers/trip.controller";
import { validateRequest } from "../middlewares/validatorRequest";
import { createTripSchema } from "../validationSchemas/tripSchema";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.post(
  "/create",
  authenticateToken,
  validateRequest(createTripSchema),
  createTrip
);
router.post(
  "/update/:id",
  authenticateToken,
  validateRequest(createTripSchema),
  updateTrip
);
router.get("/get/:id", authenticateToken, getTripById);
router.get("/getAll", authenticateToken, getTrips);
router.delete("/delete/:id", authenticateToken, deleteTrip);

export { router as tripRouter };
