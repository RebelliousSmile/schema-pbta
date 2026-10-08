import { z } from "zod";
import { gameRefSchema, nonEmptyString, portableCount, portableInteger, slugSchema } from "./shared.js";

const selfSchema = z.strictObject({
  min: portableInteger.meta({ description: "Lowest value printed on the Self track." }),
  max: portableInteger.meta({ description: "Highest value printed on the Self track." }),
  value: portableInteger.meta({ description: "Current position on the Self track." }),
}).meta({ description: "The Self track of the card and the mark on it." });

/**
 * The Masks non-player character card. It is a document of its own and not an
 * extension of the generic `npc`: the card has no `attributes`, no cited moves,
 * and its conditions are names, not checkboxes.
 */
export const masksNpcSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the character." }),
  name: nonEmptyString.meta({ description: "Human-readable character name." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this character belongs to." }),
  description: nonEmptyString.meta({ description: "Background of the character, written below the card." }),
  tags: z.array(nonEmptyString).optional().meta({ description: "Free-form tags attached to the character." }),
  generation: nonEmptyString.optional().meta({ description: "Generation line of the card." }),
  realName: nonEmptyString.optional().meta({ description: "Real name line of the card." }),
  drive: nonEmptyString.optional().meta({ description: "Drive of the character." }),
  abilities: nonEmptyString.optional().meta({ description: "Abilities line of the card." }),
  resistance: portableCount.optional().meta({ description: "Resistance printed in the circled figure of the card." }),
  conditions: z.array(nonEmptyString).optional().meta({ description: "Names of the Conditions the character carries." }),
  self: selfSchema.meta({ description: "The Self track of the card." }),
  worstSelf: nonEmptyString.optional().meta({ description: "Text of the worst end of the Self track." }),
  bestSelf: nonEmptyString.optional().meta({ description: "Text of the best end of the Self track." }),
  moves: z.array(nonEmptyString).optional().meta({ description: "Bulleted lines of the card's moves." }),
}).meta({
  title: "Masks NPC",
  description: "Portable representation of a Masks non-player character card.",
});
