import { z } from "zod";
import { nonEmptyString, portableCount } from "./shared.js";
import { playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";

export const theSprawlPlaybookSchema = playbookSchema.extend({
  directives: z.array(nonEmptyString).min(1).meta({ description: "Corporate directives that shape this playbook." }),
  missionGear: z.array(nonEmptyString).optional().meta({ description: "Gear selected for a mission." }),
  cred: portableCount.optional().meta({ description: "Starting Cred available to the playbook." }),
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
}).meta({ title: "The Sprawl playbook", description: "Portable single-document representation of a The Sprawl playbook." });
