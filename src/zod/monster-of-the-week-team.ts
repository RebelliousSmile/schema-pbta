import { z } from "zod";
import { gameRefSchema, nonEmptyString, portableCount, slugSchema } from "./shared.js";
import { advancementEntrySchema } from "./playbook.js";

/**
 * The Monster of the Week team playbook. A document of its own, with required lists of
 * enemies, allies and team moves: a generic NPC or playbook has none of them, so the codec
 * refuses it and a consumer resolves the two from the schema alone.
 */
export const monsterOfTheWeekTeamSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the team playbook." }),
  name: nonEmptyString.meta({ description: "Human-readable name of the team playbook." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this team playbook belongs to." }),
  quote: nonEmptyString.optional().meta({ description: "Epigraph printed under the team name." }),
  description: nonEmptyString.optional().meta({ description: "Introduction of the team playbook." }),
  gettingStarted: z.array(nonEmptyString).optional().meta({ description: "Steps printed under Getting started." }),
  setup: z.array(nonEmptyString).optional().meta({ description: "Paragraphs and prompts that set the organisation of the team up." }),
  enemies: z.array(advancementEntrySchema).meta({ description: "Chief enemies offered to the team, with the one chosen." }),
  allies: z.array(advancementEntrySchema).meta({ description: "Allies offered to the team, with the ones chosen." }),
  maneuvers: z.array(advancementEntrySchema).meta({ description: "Team moves offered to the team, with the ones chosen." }),
  assets: z.array(advancementEntrySchema).optional().meta({ description: "Assets offered to the team, with the ones earned." }),
  improvementMax: portableCount.optional().meta({ description: "Number of improvement boxes printed." }),
  improvementMarked: portableCount.optional().meta({ description: "Number of improvement boxes marked." }),
  improvement: z.array(advancementEntrySchema).optional().meta({ description: "Improvements offered when the improvement track is full." }),
  style: z.array(advancementEntrySchema).optional().meta({ description: "Team styles offered, with the one chosen." }),
}).meta({
  title: "Monster of the Week team",
  description: "Portable representation of a Monster of the Week team playbook.",
});
