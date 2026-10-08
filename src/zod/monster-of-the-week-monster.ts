import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared.js";
import { motwStatBlock } from "./motw-shared.js";

/**
 * The Monster of the Week monster sheet. Its `monsterType` is required and the threat page
 * has none, so a threat is refused here and a monster there.
 */
export const monsterOfTheWeekMonsterSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the monster." }),
  name: nonEmptyString.meta({ description: "Human-readable monster name." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this monster belongs to." }),
  monsterType: nonEmptyString.meta({ description: "Type of the monster, as printed under its name." }),
  bestiary: nonEmptyString.optional().meta({ description: "Where the monster is described, as printed on the sheet." }),
  ...motwStatBlock,
}).meta({
  title: "Monster of the Week monster",
  description: "Portable representation of a Monster of the Week monster sheet.",
});
