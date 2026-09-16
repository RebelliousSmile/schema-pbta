import { z } from "zod";
import { nonEmptyString, portableCount, portableInteger } from "./shared.js";
import { playbookSchema } from "./playbook.js";

const conditionSchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Condition name." }),
  description: z.string().optional().meta({ description: "Effect or fictional meaning of the condition." }),
}).meta({ description: "A condition associated with the skin." });

const stringSchema = z.strictObject({
  max: portableCount.meta({ description: "Maximum Strings the skin can hold." }),
  starting: portableCount.optional().meta({ description: "Strings held at character creation." }),
}).meta({ description: "String economy configuration." });

/** Monsterhearts skin data in one portable TOML document. */
export const monsterheartsPlaybookSchema = playbookSchema.extend({
  strings: stringSchema.optional().meta({ description: "Starting String economy." }),
  conditions: z.array(conditionSchema).optional().meta({ description: "Conditions named by this skin." }),
  sexMove: nonEmptyString.meta({ description: "Move triggered by intimacy." }),
  darkestSelf: nonEmptyString.meta({ description: "The skin's Darkest Self text." }),
  backstory: z.array(nonEmptyString).optional().meta({ description: "Backstory prompts and choices." }),
  advances: z.array(nonEmptyString).min(1).meta({ description: "Skin-specific advances." }),
  harm: portableInteger.optional().meta({ description: "Starting harm value when the skin configures one." }),
}).meta({ title: "Monsterhearts playbook", description: "Portable single-document representation of a Monsterhearts skin." });
