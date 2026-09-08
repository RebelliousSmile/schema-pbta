import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared";
import { moveEntry } from "./move";

/**
 * An NPC: anyone the heroes face.
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

export const npcSchema = z.strictObject({
  slug: slugSchema,
  name: nonEmptyString,
  game: gameRefSchema,
  /** An adversary without tags is still an adversary; one without a
   * description does not show up. */
  description: nonEmptyString,
  tags: z.array(nonEmptyString).optional(),
  /** Keys must exist in `npc.attributes` of the game definition. Optional: an
   * adversary described in two lines carries none. */
  attributes: z.record(z.string(), attributeValue).optional(),
  /**
   * Cited by slug or written inline, exactly as in a playbook. An NPC move
   * needs no roll block.
   */
  moves: z.array(moveEntry),
  /** The drive, the impulse, the agenda: named differently game to game, hence
   * generic here. */
  drive: nonEmptyString.optional(),
});
