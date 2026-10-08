import { z } from "zod";
import { nonEmptyString, portableCount, portableInteger } from "./shared.js";
import { advancementEntrySchema, playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";

const statRangeSchema = z.strictObject({
  min: portableInteger.meta({ description: "Lowest displayed value for this Label." }),
  max: portableInteger.meta({ description: "Highest displayed value for this Label." }),
}).meta({ description: "Display bounds for one Masks Label; they do not constrain its current value." });

const conditionSchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Condition name, as the game definition declares it." }),
  description: z.string().optional().meta({ description: "Penalty or fictional meaning of the condition." }),
  checked: z.boolean().optional().meta({ description: "Whether the condition is currently marked." }),
}).meta({ description: "One Condition of the sheet and whether it is marked." });

const drivesSchema = z.strictObject({
  intro: z.array(nonEmptyString).optional().meta({ description: "Paragraphs introducing the Drives of the playbook." }),
  options: z.array(advancementEntrySchema).meta({ description: "Drives the playbook offers, each with its marked state." }),
}).meta({ description: "The Drives of a playbook." });

export const masksPlaybookSchema = playbookSchema.extend({
  heroName: nonEmptyString.optional().meta({ description: "Name of the hero, written in the header of both faces." }),
  statRanges: z.record(z.string(), statRangeSchema).optional().meta({ description: "Optional display bounds keyed by Masks Label." }),
  conditions: z.array(conditionSchema).optional().meta({ description: "Conditions of the sheet with their penalty and marked state." }),
  momentUnlocked: z.boolean().optional().meta({ description: "Whether the Moment of Truth is unlocked." }),
  influenceOptions: z.array(nonEmptyString).optional().meta({ description: "Options offered by the Influence frame." }),
  potentialMax: portableCount.optional().meta({ description: "Number of Potential boxes printed on the sheet." }),
  drives: drivesSchema.optional().meta({ description: "Drives offered by the playbook." }),
  realName: nonEmptyString.optional().meta({ description: "Real name line of the identity block." }),
  abilities: nonEmptyString.optional().meta({ description: "Abilities line of the identity block." }),
  demeanor: nonEmptyString.optional().meta({ description: "Demeanor line of the identity block." }),
  backstory: z.array(nonEmptyString).optional().meta({ description: "Backstory prompts and choices." }),
  relationships: z.array(nonEmptyString).optional().meta({ description: "Relationship prompts of the playbook." }),
  influence: z.array(nonEmptyString).optional().meta({ description: "Characters over whom the playbook starts with Influence." }),
  potential: portableCount.optional().meta({ description: "Potential marks currently checked." }),
  momentOfTruth: nonEmptyString.meta({ description: "The playbook's Moment of Truth text." }),
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
}).meta({ title: "Masks playbook", description: "Portable single-document representation of a Masks playbook." });
