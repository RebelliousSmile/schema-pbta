import { z } from "zod";
import { nonEmptyString, portableCount } from "./shared.js";

/**
 * The stat block the Monster of the Week monster sheet and the threat page both print:
 * motivation, powers, attacks, harm capacity and its boxes, armour, weaknesses. It is
 * spread into two strict objects and never exported by the package, so each document stays
 * a closed shape of its own and one can never stand in for the other.
 */
export const motwStatBlock = {
  motivation: nonEmptyString.meta({ description: "Motivation of the creature, as printed beside its type." }),
  description: nonEmptyString.optional().meta({ description: "Prose describing the creature." }),
  powers: z.array(nonEmptyString).optional().meta({ description: "Lines of the powers of the creature." }),
  attacks: z.array(nonEmptyString).optional().meta({ description: "Lines of the attacks of the creature, with their harm and tags." }),
  harmCapacity: portableCount.optional().meta({ description: "Number of harm boxes printed for the creature." }),
  harmMarked: portableCount.optional().meta({ description: "Number of harm boxes currently marked." }),
  armour: portableCount.optional().meta({ description: "Armour value of the creature." }),
  armourNote: nonEmptyString.optional().meta({ description: "What gives the armour or what it does not stop." }),
  weaknesses: z.array(nonEmptyString).optional().meta({ description: "Lines of the weaknesses of the creature." }),
};
