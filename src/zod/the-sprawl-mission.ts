import { z } from "zod";
import { gameRefSchema, nonEmptyString, slugSchema } from "./shared.js";
import { sprawlHourTrack } from "./sprawl-shared.js";

const countdown = z.strictObject({
  ...sprawlHourTrack,
  steps: z.array(nonEmptyString).max(7).optional().meta({ description: "What happens at each printed hour of the countdown." }),
}).meta({ description: "A countdown running from noon to midnight." });

/** The mission sheet: an investigation page and an action page, printed side by side. */
export const theSprawlMissionSchema = z.strictObject({
  slug: slugSchema.meta({ description: "Stable kebab-case identifier of the mission." }),
  name: nonEmptyString.meta({ description: "Name of the mission." }),
  game: gameRefSchema.meta({ description: "Folder slug of the game this mission belongs to." }),
  getTheJob: nonEmptyString.optional().meta({ description: "How the crew gets the job." }),
  investigation: countdown.optional().meta({ description: "Countdown of the investigation page." }),
  action: countdown.optional().meta({ description: "Countdown of the action page." }),
  involvedParties: z.array(nonEmptyString).optional().meta({ description: "Parties involved in the mission." }),
  whatIsGoingOn: nonEmptyString.optional().meta({ description: "What is going on behind the job." }),
  twist: nonEmptyString.optional().meta({ description: "The twist that waits for the crew." }),
  security: z.array(nonEmptyString).optional().meta({ description: "Lines of the security of the target." }),
  missionDirectives: z.array(nonEmptyString).optional().meta({ description: "Directives of the mission." }),
  getPaid: nonEmptyString.optional().meta({ description: "How the crew gets paid." }),
}).meta({ title: "The Sprawl mission", description: "Portable representation of a The Sprawl mission sheet." });
