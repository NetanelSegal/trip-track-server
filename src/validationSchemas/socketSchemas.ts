import { z } from "zod";

export const socketDataSchema = {
  joinTrip: z.string({ message: "tripId must be a string" }),
  updateLocation: [
    z.string({ message: "tripId must be a string" }),
    z.object({
      lon: z.number({ message: "lon must be a number" }),
      lat: z.number({ message: "lat must be a number" }),
    }),
  ],
  finishExperience: z.string({ message: "tripId must be a string" }),
  sendMessage: [
    z.string({ message: "tripId must be a string" }),
    z
      .string({ message: "message must be a string" })
      .max(1000, "Message must be at most 1000 characters long")
      .min(1, "Message must be at least 1 character long"),
  ],
};
