import { z } from "zod";
import {
  gameRefSchema,
  nonEmptyString,
  portableCount,
  portableInteger,
  slugSchema,
} from "./shared";

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
  label: nonEmptyString.meta({ description: "Human-readable label for this result tier." }),
  text: nonEmptyString.meta({ description: "Plain-text outcome for this result tier." }),
}).meta({ description: "One possible outcome of a move roll." });

/**
 * The roll of a move.
 *
 * `rollType` carries what upstream carries: the key of one of the game's stats,
 * or `formula` when the move rolls its own formula, or `none`. The whole block
 * is optional, and a move without it carries no `results` either — a constraint
 * between two fields, hence checked by the reference validator.
 */
const moveRollSchema = z.strictObject({
  rollType: nonEmptyString.meta({
    description: "Game stat key, `formula`, or `none` describing how the move rolls.",
  }),
  rollFormula: nonEmptyString.optional().meta({
    description: "Explicit roll formula when rollType is `formula`.",
  }),
  rollMod: portableInteger.optional().meta({
    description: "Signed 32-bit modifier added to the roll.",
  }),
}).meta({ description: "Roll configuration for a move." });

export const moveSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the move." }),
  name: nonEmptyString.meta({ description: "Human-readable move name." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this move belongs to." }),
  /** A key of the game's `moveTypes`, character side or NPC side. */
  moveType: nonEmptyString.meta({ description: "Key declared in the game's move type vocabulary." }),
  /** The playbook this move belongs to, when it belongs to one. */
  playbook: slugSchema.optional().meta({ description: "Playbook slug when the move belongs to one." }),
  /** Plain text, deliberately: upstream stores an `HTMLField`. */
  description: nonEmptyString.meta({ description: "Plain-text explanation of the move." }),
  /**
   * The trigger sentence. Foundry buries it in the description; a printed sheet
   * sets it apart, so it gets its own field.
   */
  trigger: nonEmptyString.optional().meta({ description: "Situation that triggers the move." }),
  roll: moveRollSchema.optional().meta({ description: "Optional roll configuration." }),
  /** Free keys, expected to follow the game's `rollResults`. */
  results: z.record(z.string(), moveResultSchema).optional().meta({
    description: "Outcome entries keyed by the game's roll result vocabulary.",
  }),
  uses: portableCount.optional().meta({ description: "Available uses, stored as an unsigned 32-bit count." }),
  choices: nonEmptyString.optional().meta({ description: "Choice instructions attached to the move." }),
  tags: z.array(nonEmptyString).optional().meta({ description: "Free-form tags attached to the move." }),
}).meta({
  title: "PbtA move",
  description: "Portable representation of a Powered by the Apocalypse move.",
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
  ref: slugSchema.meta({ description: "Slug of a standalone move in the same game." }),
}).meta({ description: "Reference to a standalone move." });

export const moveInlineEntry = moveSchema.omit({ game: true, slug: true });

export const moveEntry = z.union([moveRefEntry, moveInlineEntry]).meta({
  description: "A move reference or a complete inline move.",
});
