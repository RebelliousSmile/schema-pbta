import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared.js";
import { advancementEntrySchema } from "./playbook.js";
import { motwStatBlock } from "./motw-shared.js";

/**
 * The Monster of the Week threat page. Its `threatType` is required and the monster sheet
 * has none, so a monster is refused here and a threat there.
 */
export const monsterOfTheWeekThreatSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the threat." }),
  name: nonEmptyString.meta({ description: "Human-readable threat name." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this threat belongs to." }),
  threatType: nonEmptyString.meta({ description: "Type of the threat, as printed under its name." }),
  mystery: nonEmptyString.optional().meta({ description: "Mystery the threat belongs to, as printed on the page." }),
  stages: z.array(advancementEntrySchema).optional().meta({ description: "Steps of the plan of the threat, with the ones reached." }),
  ...motwStatBlock,
}).meta({
  title: "Monster of the Week threat",
  description: "Portable representation of a Monster of the Week threat page.",
});
