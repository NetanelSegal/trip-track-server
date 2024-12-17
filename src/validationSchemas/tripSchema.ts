import { z } from 'zod';
import { ObjectId } from 'mongodb';

export enum MissionType {
  TRIVIA = 'trivia',
  INFO = 'info',
  TREASURE_FIND = 'treasure_find',
}

// Schemas for individual mission types
const TriviaSchema = z.object({
  type: z.literal(MissionType.TRIVIA),
  data: z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
  }),
});

const InfoSchema = z.object({
  type: z.literal(MissionType.INFO),
  data: z.object({
    text: z.string(),
  }),
});

const TreasureSchema = z.object({
  type: z.literal(MissionType.TREASURE_FIND),
  data: z.object({
    description: z.string(),
    photo: z.string().optional()
  }),
});

const missionSchema = z.discriminatedUnion('type', [
  TriviaSchema,
  InfoSchema,
  TreasureSchema,
]);


export const createTripSchema = z.object({
    creator: z.string(),
    guides: z.array(z.string()),
    name: z.string(),
    description: z.string(),
    stops: z.array(
        z.object({
            location: z.object({
                lon: z.number(),
                lat: z.number(),
            }),
            address: z.object({
                street: z.string(),
                city: z.string(),
                state: z.string(),
                zip: z.string(),
            }).optional(),
            mission: missionSchema,
        })
    ),
});

type TriviaData = z.infer<typeof TriviaSchema>;
type InfoData = z.infer<typeof InfoSchema>;
type TreasureData = z.infer<typeof TreasureSchema>;
type Mission = z.infer<typeof missionSchema>;
export type TripT = z.infer<typeof createTripSchema>;