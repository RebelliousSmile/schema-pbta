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

const editorialSectionSchema = z.strictObject({
  heading: nonEmptyString.meta({ description: "Heading shown for this playbook section." }),
  paragraphs: z.array(nonEmptyString).min(1).meta({ description: "Ordered plain-text paragraphs shown in this section." }),
}).meta({ description: "A named editorial region belonging to the playbook." });

const editorialSchema = z.strictObject({
  opening: editorialSectionSchema.meta({ description: "Origin and opening fiction for the skin." }),
  playAdvice: editorialSectionSchema.meta({ description: "Advice for playing this skin." }),
  darkestSelf: editorialSectionSchema.meta({ description: "The skin's Darkest Self region." }),
  sexMove: editorialSectionSchema.meta({ description: "The skin's intimacy move region." }),
  mcGuidance: editorialSectionSchema.meta({ description: "Guidance addressed to the MC." }),
  identity: editorialSectionSchema.meta({ description: "Identity choices and descriptive prompts." }),
  progression: editorialSectionSchema.meta({ description: "Advancement and continuation guidance." }),
}).meta({ description: "All editorial regions rendered as part of a Monsterhearts playbook." });

/** Monsterhearts skin data in one portable TOML document. */
export const monsterheartsPlaybookSchema = playbookSchema.extend({
  strings: stringSchema.optional().meta({ description: "Starting String economy." }),
  conditions: z.array(conditionSchema).optional().meta({ description: "Conditions named by this skin." }),
  backstory: z.array(nonEmptyString).optional().meta({ description: "Backstory prompts and choices." }),
  advances: z.array(nonEmptyString).min(1).meta({ description: "Skin-specific advances." }),
  harm: portableInteger.optional().meta({ description: "Starting harm value when the skin configures one." }),
  editorial: editorialSchema.meta({ description: "Complete editorial copy rendered with the skin." }),
}).meta({ title: "Monsterhearts playbook", description: "Portable single-document representation of a Monsterhearts skin." });
