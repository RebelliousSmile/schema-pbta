import { z } from "zod";
import { gameRefSchema, nonEmptyString, portableCount, slugSchema } from "./shared.js";
import { moveEntry } from "./move.js";

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
  label: nonEmptyString.meta({ description: "Human-readable label for the clock." }),
  /** A `key` of the game's `clockPresets`. */
  preset: nonEmptyString.meta({ description: "Key of a clock preset declared by the game." }),
  filled: portableCount.optional().meta({ description: "Number of filled segments as an unsigned 32-bit count." }),
}).meta({ description: "A clock using a preset from the game definition." });

const clockInline = z.strictObject({
  label: nonEmptyString.meta({ description: "Human-readable label for the clock." }),
  /** Ordered segment labels, written here rather than named in the game. */
  segments: z.array(nonEmptyString).min(1).meta({ description: "Ordered non-empty labels of the clock segments." }),
  filled: portableCount.optional().meta({ description: "Number of filled segments as an unsigned 32-bit count." }),
}).meta({ description: "A clock whose segments are declared inline." });

const clockSchema = z.union([clockPresetRef, clockInline]);

/** One member of the cast, optionally an NPC file of the same game. */
const castEntrySchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Human-readable cast member name." }),
  role: nonEmptyString.optional().meta({ description: "Role played by this cast member in the front." }),
  ref: slugSchema.optional().meta({ description: "Optional slug of an NPC file in the same game." }),
}).meta({ description: "One member of the front's cast." });

const threatSchema = z.strictObject({
  name: nonEmptyString.meta({ description: "Human-readable threat name." }),
  /** A key of the game's `threatTypes`. */
  type: nonEmptyString.meta({ description: "Key of a threat type declared by the game." }),
  /** A key of the game's `impulses`. */
  impulse: nonEmptyString.meta({ description: "Key of an impulse declared by the game." }),
  description: nonEmptyString.meta({ description: "Plain-text explanation of the threat." }),
  moves: z.array(moveEntry).optional().meta({ description: "Moves available to this threat." }),
  clock: clockSchema.optional().meta({ description: "Optional countdown attached to the threat." }),
}).meta({ description: "A threat advancing the front." });

/** A portent: something the players have seen coming, ticked off or not. */
const portentSchema = z.strictObject({
  text: nonEmptyString.meta({ description: "Event foreshadowing the front's progression." }),
  done: z.boolean().optional().meta({ description: "Whether this portent has already occurred." }),
}).meta({ description: "One visible sign of the approaching doom." });

export const frontSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the front." }),
  name: nonEmptyString.meta({ description: "Human-readable front name." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this front belongs to." }),
  concept: nonEmptyString.meta({ description: "Short concept summarizing the front." }),
  description: nonEmptyString.optional().meta({ description: "Plain-text explanation of the front." }),
  /** Open questions the front puts to the table. */
  stakes: z.array(nonEmptyString).optional().meta({ description: "Open questions the front puts to the table." }),
  cast: z.array(castEntrySchema).optional().meta({ description: "People involved in the front." }),
  threats: z.array(threatSchema).min(1).meta({ description: "Non-empty list of threats driving the front." }),
  portents: z.array(portentSchema).optional().meta({ description: "Ordered signs that the doom is approaching." }),
  /**
   * What happens if nothing stops the front. Required, like `threats`: a front
   * with neither a threat nor a deadline describes nothing. The four other
   * blocks are optional, a front being written in passes.
   */
  doom: nonEmptyString.meta({ description: "What happens if nobody stops the front." }),
}).meta({
  title: "PbtA front",
  description: "Portable representation of a Powered by the Apocalypse front or mystery.",
});
