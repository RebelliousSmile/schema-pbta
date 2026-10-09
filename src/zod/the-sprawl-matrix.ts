import { z } from "zod";
import { gameRefSchema, nonEmptyString, portableCount, slugSchema } from "./shared.js";

const consoleScore = (what: string) => portableCount.max(6).optional().meta({ description: `Value of ${what} on the cybernetic console.` });

/** The matrix sheet of a character: avatar, console of four hexagons, holds and programs. */
export const theSprawlMatrixSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the matrix sheet." }),
  name: nonEmptyString.meta({ description: "Name of the avatar." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this sheet belongs to." }),
  avatarDescription: nonEmptyString.optional().meta({ description: "How the avatar looks in the matrix." }),
  avatarImage: nonEmptyString.optional().meta({ description: "Vault path or link of the image of the avatar." }),
  resistance: consoleScore("Resistance"),
  firewall: consoleScore("Firewall"),
  stealth: consoleScore("Stealth"),
  processor: consoleScore("Processor"),
  holds: portableCount.optional().meta({ description: "Holds currently kept." }),
  programs: z.array(z.strictObject({
    label: nonEmptyString.meta({ description: "Name of the program." }),
    checked: z.boolean().optional().meta({ description: "Whether the program is loaded." }),
  }).meta({ description: "A program of the avatar." })).optional().meta({ description: "Programs of the avatar." }),
}).meta({ title: "The Sprawl matrix sheet", description: "Portable representation of a The Sprawl matrix sheet." });
