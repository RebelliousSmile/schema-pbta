import { z } from "zod";
import { nonEmptyString, portableCount } from "./shared.js";
import { advancementEntrySchema, playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";

export const monsterOfTheWeekPlaybookSchema = playbookSchema.extend({
  luck: portableCount.optional().meta({ description: "Starting Luck marks." }),
  ratings: z.record(z.string(), portableCount).optional().meta({ description: "Playbook resources keyed by their rating name." }),
  improvements: z.array(advancementEntrySchema).min(1).meta({ description: "Improvements offered by the playbook." }),
  heroName: nonEmptyString.optional().meta({ description: "Name of the hunter, written under the playbook name." }),
  luckMax: portableCount.optional().meta({ description: "Number of Luck boxes printed." }),
  luckMarked: portableCount.optional().meta({ description: "Number of Luck boxes marked." }),
  harmMax: portableCount.optional().meta({ description: "Number of harm boxes printed." }),
  harmMarked: portableCount.optional().meta({ description: "Number of harm boxes marked." }),
  unstable: z.boolean().optional().meta({ description: "Whether the wounds of the hunter are unstable." }),
  experienceMax: portableCount.optional().meta({ description: "Number of experience boxes printed." }),
  experienceMarked: portableCount.optional().meta({ description: "Number of experience boxes marked." }),
  specialWeapon: nonEmptyString.optional().meta({ description: "Description of the special weapon of the hunter." }),
  statChoices: z.array(advancementEntrySchema).optional().meta({ description: "Stat lines offered, with the one chosen." }),
  look: z.array(nonEmptyString).optional().meta({ description: "Prompts or choices for the look of the hunter." }),
  introductions: z.array(nonEmptyString).optional().meta({ description: "Prompts for the introductions of the group." }),
  history: z.array(nonEmptyString).optional().meta({ description: "Prompts for the history between the hunters." }),
  advancements: z.array(advancementEntrySchema).optional().meta({ description: "Advanced improvements offered by the playbook." }),
  notes: z.array(nonEmptyString).optional().meta({ description: "Lines left for notes on the game." }),
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
}).meta({ title: "Monster of the Week playbook", description: "Portable single-document representation of a Monster of the Week playbook." });
