import { z } from "zod";
import { nonEmptyString, portableCount } from "./shared.js";
import { playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";

export const masksPlaybookSchema = playbookSchema.extend({
  influence: z.array(nonEmptyString).optional().meta({ description: "Characters over whom the playbook starts with Influence." }),
  potential: portableCount.optional().meta({ description: "Starting Potential marks." }),
  momentOfTruth: nonEmptyString.meta({ description: "The playbook's Moment of Truth text." }),
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
}).meta({ title: "Masks playbook", description: "Portable single-document representation of a Masks playbook." });
