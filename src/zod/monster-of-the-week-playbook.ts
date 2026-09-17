import { z } from "zod";
import { nonEmptyString, portableCount } from "./shared.js";
import { playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";

export const monsterOfTheWeekPlaybookSchema = playbookSchema.extend({
  luck: portableCount.optional().meta({ description: "Starting Luck marks." }),
  ratings: z.record(z.string(), portableCount).optional().meta({ description: "Playbook resources keyed by their rating name." }),
  improvements: z.array(nonEmptyString).min(1).meta({ description: "Improvements offered by the playbook." }),
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
}).meta({ title: "Monster of the Week playbook", description: "Portable single-document representation of a Monster of the Week playbook." });
