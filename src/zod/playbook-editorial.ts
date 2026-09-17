import { z } from "zod";
import { nonEmptyString } from "./shared.js";

export const editorialSectionSchema = z.strictObject({
  heading: nonEmptyString.meta({ description: "Heading shown for this playbook section." }),
  paragraphs: z.array(nonEmptyString).min(1).meta({ description: "Ordered plain-text paragraphs shown in this section." }),
}).meta({ description: "A named editorial region belonging to a playbook." });

export const playbookEditorialSchema = z.strictObject({
  opening: editorialSectionSchema.meta({ description: "Opening fiction for the playbook." }),
  playAdvice: editorialSectionSchema.meta({ description: "Advice for playing the character." }),
  identity: editorialSectionSchema.meta({ description: "Identity choices and descriptive prompts." }),
  progression: editorialSectionSchema.meta({ description: "Advancement and continuation guidance." }),
}).meta({ description: "Editorial regions rendered as part of a character playbook." });
