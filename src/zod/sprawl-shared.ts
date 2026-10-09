import { z } from "zod";
import { nonEmptyString, portableCount } from "./shared.js";

/**
 * Shapes the Sprawl documents share. Spread into strict objects and never exported by the
 * package, so each document stays a closed shape of its own.
 */

/** The hour track the Sprawl prints for harm, threats and corporations: six segments. */
export const SPRAWL_HOUR_SEGMENTS = 6;

export const sprawlHourTrack = {
  hoursMarked: portableCount.max(SPRAWL_HOUR_SEGMENTS).optional().meta({ description: "Number of segments of the six-segment hour track currently marked." }),
};

/** A labelled line the sheet leaves to fill in. */
export const sprawlLineSchema = z.strictObject({
  label: nonEmptyString.meta({ description: "Printed label of the line." }),
  value: nonEmptyString.optional().meta({ description: "Text written on the line." }),
}).meta({ description: "A labelled line of the sheet." });

/** Fields every card of the Master of Ceremonies carries. */
export const sprawlCardFields = {
  name: nonEmptyString.meta({ description: "Human-readable name of the card." }),
  description: nonEmptyString.optional().meta({ description: "Prose describing the card." }),
};
