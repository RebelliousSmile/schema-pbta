import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared";
import { moveEntry } from "./move";

/**
 * A front: a threat in motion, with what it wants and how long the heroes have.
 *
 * Generic on purpose. What differs game to game — the categories of threat, the
 * impulses, the shape of the clocks — lives in the `fronts` block of the game
 * definition, not here. Same conventions as everywhere: `.optional()` and never
 * `.default()`, strict objects, no `.refine()`.
 */

/**
 * A clock, either shaped by the game or written on the spot.
 *
 * Two strict branches, so that carrying both `preset` and `segments` matches
 * neither: a clock takes its segments from the game's `clockPresets` or lists
 * its own labels, never both. How `filled` relates to the number of segments is
 * not expressible in JSON Schema and belongs to the reference pass.
 */
const clockPresetRef = z.strictObject({
  label: nonEmptyString,
  /** A `key` of the game's `clockPresets`. */
  preset: nonEmptyString,
  filled: z.number().int().nonnegative().optional(),
});

const clockInline = z.strictObject({
  label: nonEmptyString,
  /** Ordered segment labels, written here rather than named in the game. */
  segments: z.array(nonEmptyString).min(1),
  filled: z.number().int().nonnegative().optional(),
});

const clockSchema = z.union([clockPresetRef, clockInline]);

/** One member of the cast, optionally an NPC file of the same game. */
const castEntrySchema = z.strictObject({
  name: nonEmptyString,
  role: nonEmptyString.optional(),
  ref: slugSchema.optional(),
});

const threatSchema = z.strictObject({
  name: nonEmptyString,
  /** A key of the game's `threatTypes`. */
  type: nonEmptyString,
  /** A key of the game's `impulses`. */
  impulse: nonEmptyString,
  description: nonEmptyString,
  moves: z.array(moveEntry).optional(),
  clock: clockSchema.optional(),
});

/** A portent: something the players have seen coming, ticked off or not. */
const portentSchema = z.strictObject({
  text: nonEmptyString,
  done: z.boolean().optional(),
});

export const frontSchema = z.strictObject({
  slug: slugSchema,
  name: nonEmptyString,
  game: gameRefSchema,
  concept: nonEmptyString,
  description: nonEmptyString.optional(),
  /** Open questions the front puts to the table. */
  stakes: z.array(nonEmptyString).optional(),
  cast: z.array(castEntrySchema).optional(),
  threats: z.array(threatSchema).min(1),
  portents: z.array(portentSchema).optional(),
  /**
   * What happens if nothing stops the front. Required, like `threats`: a front
   * with neither a threat nor a deadline describes nothing. The four other
   * blocks are optional, a front being written in passes.
   */
  doom: nonEmptyString,
});
