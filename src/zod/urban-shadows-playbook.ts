import { z } from "zod";
import { nonEmptyString, portableCount, portableInteger } from "./shared.js";
import { advancementEntrySchema, playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";

const relationshipSchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Name or concise label of the mortal relationship." }),
  description: z.string().optional().meta({ description: "Why this mortal relationship matters." }),
}).meta({ description: "One mortal relationship that anchors the character." });

const scarSchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Human-readable scar label." }),
  stat: nonEmptyString.optional().meta({ description: "Stat reduced by this scar." }),
  modifier: portableInteger.optional().meta({ description: "Signed modifier applied by the scar." }),
}).meta({ description: "One lasting scar." });

const harmSchema = z.strictObject({
  armor: portableCount.optional().meta({ description: "Armor currently available to the playbook." }),
  faint: portableCount.optional().meta({ description: "Number of faint-harm boxes." }),
  serious: portableCount.optional().meta({ description: "Number of serious-harm boxes." }),
  critical: portableCount.optional().meta({ description: "Number of critical-harm boxes." }),
}).meta({ description: "Harm track configuration for an Urban Shadows playbook." });

const corruptionSchema = z.strictObject({
  trigger: nonEmptyString.meta({ description: "Fictional trigger that marks corruption." }),
  advances: z.array(advancementEntrySchema).min(1).meta({ description: "Corruption advances offered by the playbook." }),
  moves: z.array(nonEmptyString).optional().meta({ description: "Corruption moves available to the playbook." }),
}).meta({ description: "Corruption track and its consequences." });

/**
 * Urban Shadows extends the portable PbtA playbook with mechanics that are
 * meaningless to the other games: mortal ties, status, harm, scars and
 * corruption. It intentionally remains a single TOML document.
 */
export const urbanShadowsPlaybookSchema = playbookSchema.extend({
  statuses: z.record(z.string(), portableInteger).optional().meta({ description: "Starting Circle status values keyed by Circle." }),
  mortalRelationships: z.array(relationshipSchema).optional().meta({ description: "Mortal relationships selected by the playbook." }),
  harm: harmSchema.optional().meta({ description: "Harm track configuration." }),
  scars: z.array(scarSchema).optional().meta({ description: "Scars offered by the playbook." }),
  corruption: corruptionSchema.meta({ description: "Urban Shadows corruption mechanics." }),
  endMove: nonEmptyString.meta({ description: "Move resolved when the character dies or retires." }),
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
}).meta({
  title: "Urban Shadows playbook",
  description: "Portable single-document representation of an Urban Shadows character playbook.",
});
