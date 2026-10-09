import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared.js";
import { sprawlCardFields } from "./sprawl-shared.js";

/** A resource card of the Master of Ceremonies. */
export const theSprawlResourceSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the resource." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this resource belongs to." }),
  ...sprawlCardFields,
  tags: z.array(nonEmptyString).optional().meta({ description: "Tags of the resource." }),
  skills: z.array(nonEmptyString).optional().meta({ description: "Skills and background of the resource." }),
}).meta({ title: "The Sprawl resource", description: "Portable representation of a The Sprawl resource card." });
