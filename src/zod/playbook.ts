import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared";
import { moveEntry, moveInlineEntry, moveRefEntry } from "./move";

/**
 * A character playbook.
 *
 * Same conventions as everywhere here: `.optional()` and never `.default()`,
 * strict objects, no `.refine()`.
 */

/** Starting values: whatever an attribute of the game definition can hold. */
const attributeValue = z.union([
  z.string(),
  z.number(),
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
  granted: z.number().int().nonnegative(),
  advancement: z.number().int().nonnegative(),
};

const choiceSchema = z.union([
  moveRefEntry.extend(choiceExtension),
  moveInlineEntry.extend(choiceExtension),
]);

const choiceSetSchema = z.strictObject({
  title: nonEmptyString,
  description: nonEmptyString.optional(),
  type: z.enum(["single", "multi"]),
  repeatable: z.boolean().optional(),
  /** What the choice hangs on: character creation, an advancement, a level. */
  grantOn: nonEmptyString.optional(),
  choices: z.array(choiceSchema),
});

/** A creation question: a label, and the options offered under it. */
const creationQuestionSchema = z.strictObject({
  label: nonEmptyString,
  options: z.array(nonEmptyString).min(1),
});

/** A piece of gear. Only `name` is required: gear is often cited bare. */
const gearSchema = z.strictObject({
  name: nonEmptyString,
  equipmentType: nonEmptyString.optional(),
  description: nonEmptyString.optional(),
  quantity: z.number().int().optional(),
  tags: z.array(nonEmptyString).optional(),
});

export const playbookSchema = z.strictObject({
  slug: slugSchema,
  name: nonEmptyString,
  game: gameRefSchema,
  /** Which sheet of the game definition this playbook drives, when it matters. */
  actorType: nonEmptyString.optional(),
  description: nonEmptyString,
  playbookImage: nonEmptyString.optional(),
  /** Keys must exist in `character.stats` of the game definition. */
  stats: z.record(z.string(), z.number().int()),
  /** The line of text that comes with the spread, as upstream carries it. */
  statsDetail: nonEmptyString.optional(),
  /** Keys must exist in `character.attributes` of the game definition. */
  attributes: z.record(z.string(), attributeValue).optional(),
  moves: z.array(moveEntry),
  /** Slugs granted outright at creation, distinct from what is available. */
  startingMoves: z.array(slugSchema).optional(),
  choiceSets: z.array(choiceSetSchema).optional(),
  advancement: z.array(nonEmptyString).optional(),
  creation: z.array(creationQuestionSchema).optional(),
  gear: z.array(gearSchema).optional(),
});
