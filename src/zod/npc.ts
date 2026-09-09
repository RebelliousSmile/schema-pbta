import { z } from "zod";
import { gameRefSchema, nonEmptyString, portableNumber, slugSchema } from "./shared";
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
  portableNumber,
  z.boolean(),
  z.array(nonEmptyString),
]);

export const npcSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the NPC." }),
  name: nonEmptyString.meta({ description: "Human-readable NPC name." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this NPC belongs to." }),
  /** An adversary without tags is still an adversary; one without a
   * description does not show up. */
  description: nonEmptyString.meta({ description: "Plain-text presentation of the NPC." }),
  tags: z.array(nonEmptyString).optional().meta({ description: "Free-form tags attached to the NPC." }),
  /** Keys must exist in `npc.attributes` of the game definition. Optional: an
   * adversary described in two lines carries none. */
  attributes: z.record(z.string(), attributeValue).optional().meta({ description: "Values keyed by the game's NPC attributes." }),
  /**
   * Cited by slug or written inline, exactly as in a playbook. An NPC move
   * needs no roll block.
   */
  moves: z.array(moveEntry).meta({ description: "Moves cited by slug or written inline for this NPC." }),
  /** The drive, the impulse, the agenda: named differently game to game, hence
   * generic here. */
  drive: nonEmptyString.optional().meta({ description: "Drive, impulse, or agenda guiding the NPC." }),
}).meta({
  title: "PbtA NPC",
  description: "Portable representation of a Powered by the Apocalypse non-player character.",
});
