import { z } from "zod";
import {
  gameRefSchema,
  nonEmptyString,
  portableCount,
  portableInteger,
  portableNumber,
  slugSchema,
} from "./shared.js";
import { moveEntry, moveInlineEntry, moveRefEntry } from "./move.js";

/**
 * A character playbook.
 *
 * Same conventions as everywhere here: `.optional()` and never `.default()`,
 * strict objects, no `.refine()`.
 */

/** Starting values: whatever an attribute of the game definition can hold. */
const attributeValue = z.union([
  z.string(),
  portableNumber,
  z.boolean(),
  z.array(nonEmptyString),
]);

/**
 * One option of a `choiceSets` entry.
 *
 * Built by extending each branch of `moveEntry` rather than by restating the
 * alternative: the exclusion between a reference and an inline body only holds
 * because both branches are strict objects, and restating it here would lose
 * that.
 *
 * Upstream identifies the referenced document by `uuid`; here it is a slug, and
 * the import adapter is what will have to map one onto the other.
 */
const choiceExtension = {
  granted: portableCount.meta({ description: "Number of times this choice is granted." }),
  advancement: portableCount.meta({ description: "Advancement step at which this choice becomes available." }),
};

const choiceSchema = z.union([
  moveRefEntry.extend(choiceExtension),
  moveInlineEntry.extend(choiceExtension),
]);

const playbookMoveEntry = z.union([
  moveRefEntry.extend({ checked: z.boolean().optional().meta({ description: "Whether this move is currently acquired." }) }),
  moveInlineEntry.extend({ checked: z.boolean().optional().meta({ description: "Whether this move is currently acquired." }) }),
]).meta({ description: "A move carried by this playbook, with its optional acquisition state." });

export const advancementEntrySchema = z.strictObject({
  label: nonEmptyString.meta({ description: "Human-readable advancement option." }),
  checked: z.boolean().optional().meta({ description: "Whether this advancement has been acquired." }),
}).meta({ description: "One advancement option and its optional acquisition state." });

const choiceSetSchema = z.strictObject({
  title: nonEmptyString.meta({ description: "Human-readable heading for the choice set." }),
  description: nonEmptyString.optional().meta({ description: "Explanation shown with the choices." }),
  type: z.enum(["single", "multi"]).meta({ description: "Whether one or several choices may be selected." }),
  repeatable: z.boolean().optional().meta({ description: "Whether this choice set can be granted more than once." }),
  /** What the choice hangs on: character creation, an advancement, a level. */
  grantOn: nonEmptyString.optional().meta({ description: "Lifecycle event that grants this choice set." }),
  choices: z.array(choiceSchema).meta({ description: "Moves offered by this choice set." }),
}).meta({ description: "A group of moves from which the player chooses." });

/** A stable creation value may have a separate human-facing label. */
const creationOptionSchema = z.union([
  nonEmptyString,
  z.strictObject({
    value: nonEmptyString.meta({ description: "Stable value persisted when this option is selected." }),
    label: nonEmptyString.meta({ description: "Human-readable label shown for this option." }),
  }).meta({ description: "Creation option with a stable persisted value and display label." }),
]);

/** Inclusive selection bounds. Omission retains the historical single-choice form. */
const creationSelectionSchema = z.strictObject({
  min: portableCount.meta({ description: "Minimum number of options selected during creation." }),
  max: portableCount.meta({ description: "Maximum number of options selected during creation." }),
}).meta({ description: "Inclusive selection cardinality for a creation question." });

/** A creation question, its options, and an optional editable attribute destination. */
const creationQuestionSchema = z.strictObject({
  label: nonEmptyString.meta({ description: "Question or prompt shown during character creation." }),
  options: z.array(creationOptionSchema).min(1).meta({ description: "Non-empty list of answers offered to the player." }),
  selection: creationSelectionSchema.optional().meta({ description: "Selection bounds; omitted questions select exactly one answer." }),
  attribute: nonEmptyString.optional().meta({
    description: "Character attribute initialized by the selection; it remains freely editable afterwards.",
  }),
}).meta({ description: "One character-creation question, its answers, cardinality, and optional attribute destination." });

/** One named starting-stat spread offered during character creation. */
const statProfileSchema = z.strictObject({
  key: slugSchema.meta({ description: "Stable key identifying this starting-stat profile." }),
  label: nonEmptyString.meta({ description: "Human-readable name of this starting-stat profile." }),
  stats: z.record(z.string(), portableInteger).meta({ description: "Signed starting values keyed by game stat." }),
}).meta({ description: "A named stat profile available during character creation." });

/** A piece of gear. Only `name` is required: gear is often cited bare. */
const gearSchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Human-readable gear name." }),
  equipmentType: nonEmptyString.optional().meta({ description: "Key declared in the game's equipment type vocabulary." }),
  description: nonEmptyString.optional().meta({ description: "Plain-text explanation of the gear." }),
  quantity: portableCount.optional().meta({ description: "Quantity held, stored as an unsigned 32-bit count." }),
  tags: z.array(nonEmptyString).optional().meta({ description: "Free-form tags attached to the gear." }),
}).meta({ description: "A piece of starting or selectable gear." });

export const playbookSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the playbook." }),
  name: nonEmptyString.meta({ description: "Human-readable playbook name." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this playbook belongs to." }),
  /** Which sheet of the game definition this playbook drives, when it matters. */
  actorType: nonEmptyString.optional().meta({ description: "Character sheet type driven by this playbook." }),
  description: nonEmptyString.meta({ description: "Plain-text explanation of the playbook." }),
  playbookImage: nonEmptyString.optional().meta({ description: "Image reference associated with the playbook." }),
  /** Keys must exist in `character.stats` of the game definition. */
  stats: z.record(z.string(), portableInteger).meta({ description: "Starting signed 32-bit stat values keyed by game stat." }),
  /** The line of text that comes with the spread, as upstream carries it. */
  statsDetail: nonEmptyString.optional().meta({ description: "Text accompanying the starting stat spread." }),
  /** Explicit starting-stat spreads. Choosing one initializes `stats`; it is not retained as character state. */
  statProfiles: z.array(statProfileSchema).optional().meta({ description: "Named starting-stat profiles offered during character creation." }),
  /** Keys must exist in `character.attributes` of the game definition. */
  attributes: z.record(z.string(), attributeValue).optional().meta({ description: "Starting values keyed by game attribute." }),
  moves: z.array(playbookMoveEntry).meta({ description: "Moves available to this playbook." }),
  /** Slugs granted outright at creation, distinct from what is available. */
  startingMoves: z.array(slugSchema).optional().meta({ description: "Slugs of moves granted at character creation." }),
  choiceSets: z.array(choiceSetSchema).optional().meta({ description: "Move choices available during creation or advancement." }),
  advancement: z.array(advancementEntrySchema).optional().meta({ description: "Advancement options offered by the playbook." }),
  creation: z.array(creationQuestionSchema).optional().meta({ description: "Questions asked during character creation." }),
  gear: z.array(gearSchema).optional().meta({ description: "Starting or selectable gear." }),
}).meta({
  title: "PbtA playbook",
  description: "Portable representation of a Powered by the Apocalypse character playbook.",
});
