import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared.js";
import { sprawlCardFields, sprawlHourTrack } from "./sprawl-shared.js";

/** A threat card of the Master of Ceremonies. */
export const theSprawlThreatSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the threat." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this threat belongs to." }),
  ...sprawlCardFields,
  threatType: z.enum(["group", "lone", "place", "current-event"]).meta({ description: "Kind of threat: group, lone wolf, place or current event." }),
  objective: nonEmptyString.optional().meta({ description: "What the threat wants." }),
  ...sprawlHourTrack,
}).meta({ title: "The Sprawl threat", description: "Portable representation of a The Sprawl threat card." });
