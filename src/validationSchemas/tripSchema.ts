import { z } from 'zod';
import { Types } from 'mongoose';

export enum MissionType {
  TRIVIA = 'trivia',
  INFO = 'info',
  TREASURE_FIND = 'treasure_find',
}

// Schemas for individual mission types
const TriviaSchema = z.object({
  type: z.literal(MissionType.TRIVIA),
  data: z.object({
    question: z.string({
      required_error: 'Trivia question is required.',
      invalid_type_error: 'Trivia question must be a string.',
    }),
    options: z.array(z.string(), {
      required_error: 'Trivia options are required.',
      invalid_type_error: 'Trivia options must be an array of strings.',
    }),
    answer: z.string({
      required_error: 'Trivia answer is required.',
      invalid_type_error: 'Trivia answer must be a string.',
    }),
  }),
});

const InfoSchema = z.object({
  type: z.literal(MissionType.INFO),
  data: z.object({
    text: z.string({
      required_error: 'Info text is required.',
      invalid_type_error: 'Info text must be a string.',
    }),
  }),
});

const TreasureSchema = z.object({
  type: z.literal(MissionType.TREASURE_FIND),
  data: z.object({
    description: z.string({
      required_error: 'Treasure description is required.',
      invalid_type_error: 'Treasure description must be a string.',
    }),
    photo: z
      .string()
      .optional()
      .or(z.undefined())
      .refine((val) => val === undefined || val.trim() !== '', {
        message: 'Treasure photo must be a non-empty string if provided.',
      }),
  }),
});

const missionSchema = z
  .discriminatedUnion('type', [TriviaSchema, InfoSchema, TreasureSchema])
  .optional();

export const createTripSchema = z.object({
  name: z.string({
    required_error: 'Trip name is required.',
    invalid_type_error: 'Trip name must be a string.',
  }),
  description: z.string({
    required_error: 'Trip description is required.',
    invalid_type_error: 'Trip description must be a string.',
  }),
  stops: z
    .array(
      z.object({
        location: z.object({
          lon: z.number({
            required_error: 'Longitude is required.',
            invalid_type_error: 'Longitude must be a number.',
          }),
          lat: z.number({
            required_error: 'Latitude is required.',
            invalid_type_error: 'Latitude must be a number.',
          }),
        }),
        address: z
          .object({
            street: z.string({
              required_error: 'Street is required.',
              invalid_type_error: 'Street must be a string.',
            }),
            city: z.string({
              required_error: 'City is required.',
              invalid_type_error: 'City must be a string.',
            }),
            state: z.string({
              required_error: 'State is required.',
              invalid_type_error: 'State must be a string.',
            }),
            zip: z.string({
              required_error: 'Zip code is required.',
              invalid_type_error: 'Zip code must be a string.',
            }),
          })
          .optional(),
        mission: missionSchema,
      }),
      {
        required_error: 'Stops are required.',
        invalid_type_error: 'Stops must be an array of objects.',
      }
    )
    .min(2, {
      message: 'Trip must have at least 2 stops.',
    }),
});

type TriviaData = z.infer<typeof TriviaSchema>;
type InfoData = z.infer<typeof InfoSchema>;
type TreasureData = z.infer<typeof TreasureSchema>;
type Mission = z.infer<typeof missionSchema>;
export type TripT = z.infer<typeof createTripSchema> & {
  creator: Types.ObjectId;
  guides: Types.ObjectId[];
};
