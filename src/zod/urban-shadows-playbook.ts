import { z } from "zod";
import { INT32_MAX, nonEmptyString, portableCount, portableInteger, slugSchema } from "./shared.js";
import { advancementEntrySchema, playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";

const relationshipSchema = z.strictObject({
  key: slugSchema.meta({ description: "Stable key persisted when this mortal relationship is selected." }),
  label: nonEmptyString.meta({ description: "Human-readable label of the mortal relationship." }),
  description: z.string().optional().meta({ description: "Why this mortal relationship matters." }),
}).meta({ description: "One editorially described mortal relationship available during creation." });

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
  track: z.number().int().min(1).max(INT32_MAX).optional().meta({ description: "Number of boxes printed on the corruption track." }),
}).meta({ description: "Corruption track and its consequences." });

const extraSchema = z.strictObject({
  key: slugSchema.meta({ description: "Stable key of the frame, unique within the playbook." }),
  label: nonEmptyString.meta({ description: "Printed title of the frame." }),
  text: nonEmptyString.optional().meta({ description: "Plain-text body of the frame." }),
  items: z.array(nonEmptyString).optional().meta({ description: "Ordered lines listed in the frame." }),
}).meta({ description: "One titled frame printed only on this playbook." });

/** The four range tags of the book's tag table: the reach of a weapon, written once, in print order. */
export const URBAN_SHADOWS_EQUIPMENT_RANGES = ["hand", "close", "near", "far"] as const;

/**
 * One piece of Urban Shadows gear, written as the booklet prints it:
 * `9mm Beretta (2-harm near loud concealable)`. Only `name` is required: a line of prose
 * ("a used car") is a bare name. There is no `equipmentType` and no `quantity`.
 * `harm` is either a count (`n-harm`) or the word `stun` (`s-harm`, which carries no value),
 * and `armor` carries both its value and its mode, so neither "s-harm with a value" nor
 * "armor without a mode" can be written.
 */
const equipmentSchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Human-readable name of the piece of gear, or a line of prose such as `A used car`." }),
  description: nonEmptyString.optional().meta({ description: "Plain-text explanation of the gear." }),
  harm: z.union([portableCount, z.literal("stun")]).optional().meta({ description: "Harm the gear inflicts: a count for `n-harm`, or `stun` for `s-harm` (stun harm has no value)." }),
  armor: z.strictObject({
    value: portableCount.meta({ description: "Armor value." }),
    mode: z.enum(["base", "bonus"]).meta({ description: "`base` is `x-armor` (does not stack); `bonus` is `armor+x` (stacks)." }),
  }).optional().meta({ description: "Armor the gear grants, written `x-armor` or `armor+x`." }),
  range: z.array(z.enum(URBAN_SHADOWS_EQUIPMENT_RANGES)).min(1).optional().meta({ description: "Range tags of the gear, in printed order (`hand`, `close`, `near`, `far`)." }),
  tags: z.array(nonEmptyString).optional().meta({ description: "Item tags such as `loud` or `concealable`. The vocabulary published with the playbook presentation is open: a tag outside it is valid." }),
}).meta({ description: "A piece of Urban Shadows gear, written as the booklet prints it." });

/**
 * Urban Shadows extends the portable PbtA playbook with mechanics that are
 * meaningless to the other games: mortal ties, status, harm, scars and
 * corruption. It intentionally remains a single TOML document.
 */
export const urbanShadowsPlaybookSchema = playbookSchema.omit({ startingMoves: true, gear: true }).extend({
  gear: z.array(equipmentSchema).optional().meta({ description: "Starting gear: one element per object held, not the list of choices the booklet prints." }),
  characterName: nonEmptyString.optional().meta({ description: "Name and pronouns written on the sheet by the player." }),
  demeanor: nonEmptyString.optional().meta({ description: "Demeanor line of the header, written by the player." }),
  look: nonEmptyString.optional().meta({ description: "Look line of the header, written by the player." }),
  statuses: z.record(z.string(), portableInteger).optional().meta({ description: "Starting Circle status values keyed by Circle." }),
  mortalRelationships: z.array(relationshipSchema).optional().meta({ description: "Editorial catalogue of mortal relationships available to the playbook." }),
  harm: harmSchema.optional().meta({ description: "Harm track configuration." }),
  scars: z.array(scarSchema).optional().meta({ description: "Scars offered by the playbook." }),
  corruption: corruptionSchema.meta({ description: "Urban Shadows corruption mechanics." }),
  endMove: nonEmptyString.meta({ description: "Move resolved when the character dies or retires." }),
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
  advancementCircles: z.array(nonEmptyString).optional().meta({ description: "Circles carrying an advancement mark, as keys of `stats`, in printed order." }),
  markedCircles: z.array(nonEmptyString).optional().meta({ description: "Circles marked on the advancement track since the last advance, as keys of `advancementCircles`; play state, cleared when the character advances." }),
  laterAdvancement: z.array(advancementEntrySchema).optional().meta({ description: "Advancement options offered once the first list has been drawn on enough." }),
  letItOut: z.array(nonEmptyString).optional().meta({ description: "Abilities the playbook gains when it lets it out." }),
  intimacy: nonEmptyString.optional().meta({ description: "Plain text of the playbook's intimacy move." }),
  debts: z.array(nonEmptyString).optional().meta({ description: "Starting debt prompts printed on the playbook." }),
  extras: z.array(extraSchema).optional().meta({ description: "Titled frames printed only on this playbook." }),
}).meta({
  title: "Urban Shadows playbook",
  description: "Portable single-document representation of an Urban Shadows character playbook.",
});
