import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared";

/**
 * A move, canonical form.
 *
 * Conventions, as in every schema module here: `.optional()` and never
 * `.default()`, strict objects, and no `.refine()` — cross-field constraints
 * belong to the reference validator.
 */

/**
 * One entry of a move's `results` table.
 *
 * Upstream (`pbta` for Foundry) calls this `moveResults` and stores the body in
 * an HTML field named `value`. Here it is `text`, and it is plain text: turning
 * HTML into text is the import adapter's job, not the schema's.
 */
const moveResultSchema = z.strictObject({
  label: nonEmptyString,
  text: nonEmptyString,
});

/**
 * The roll of a move.
 *
 * `rollType` carries what upstream carries: the key of one of the game's stats,
 * or `formula` when the move rolls its own formula, or `none`. The whole block
 * is optional, and a move without it carries no `results` either — a constraint
 * between two fields, hence checked by the reference validator.
 */
const moveRollSchema = z.strictObject({
  rollType: nonEmptyString,
  rollFormula: nonEmptyString.optional(),
  rollMod: z.number().int().optional(),
});

export const moveSchema = z.strictObject({
  slug: slugSchema,
  name: nonEmptyString,
  game: gameRefSchema,
  /** A key of the game's `moveTypes`, character side or NPC side. */
  moveType: nonEmptyString,
  /** The playbook this move belongs to, when it belongs to one. */
  playbook: slugSchema.optional(),
  /** Plain text, deliberately: upstream stores an `HTMLField`. */
  description: nonEmptyString,
  /**
   * The trigger sentence. Foundry buries it in the description; a printed sheet
   * sets it apart, so it gets its own field.
   */
  trigger: nonEmptyString.optional(),
  roll: moveRollSchema.optional(),
  /** Free keys, expected to follow the game's `rollResults`. */
  results: z.record(z.string(), moveResultSchema).optional(),
  uses: z.number().int().optional(),
  choices: nonEmptyString.optional(),
  tags: z.array(nonEmptyString).optional(),
});

/**
 * A move as it appears inside another document — a playbook, an NPC, a front.
 *
 * Two shapes, and only two: a reference to a move file of the same game, or a
 * move written on the spot. Both branches are strict, and that is what makes
 * the alternative enforceable: a hybrid object carrying a `ref` next to a body
 * matches neither branch.
 *
 * The inline branch drops `game` — the host document already says which game
 * it belongs to — and drops `slug`, which is what makes an inline move
 * unaddressable: no `ref` can aim at it, and it enters neither the reference
 * check nor the uniqueness check of the reference validator. A move meant to be
 * cited elsewhere is written in `examples/<game>/move/`.
 *
 * Both branches are exported next to their union: a Zod union carries no
 * `.extend()`, and `playbook.ts` needs to extend each branch on its own.
 */
export const moveRefEntry = z.strictObject({
  ref: slugSchema,
});

export const moveInlineEntry = moveSchema.omit({ game: true, slug: true });

export const moveEntry = z.union([moveRefEntry, moveInlineEntry]);
