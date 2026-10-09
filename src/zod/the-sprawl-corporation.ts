import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared.js";
import { sprawlCardFields, sprawlHourTrack } from "./sprawl-shared.js";

/** A corporation card of the Master of Ceremonies. */
export const theSprawlCorporationSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the corporation." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this corporation belongs to." }),
  ...sprawlCardFields,
  expertise: z.array(nonEmptyString).optional().meta({ description: "Areas of expertise of the corporation." }),
  customMoves: z.array(nonEmptyString).optional().meta({ description: "Custom moves of the corporation." }),
  ...sprawlHourTrack,
}).meta({ title: "The Sprawl corporation", description: "Portable representation of a The Sprawl corporation card." });
