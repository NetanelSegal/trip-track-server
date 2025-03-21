import { z } from 'zod';
import { TripStatusArray } from 'trip-track-package';

export const tripUpdateStatusSchema = z.object({ status: z.enum(TripStatusArray) });
