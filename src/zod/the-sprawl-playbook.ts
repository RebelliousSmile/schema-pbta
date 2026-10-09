import { z } from "zod";
import { nonEmptyString, portableCount, portableInteger } from "./shared.js";
import { advancementEntrySchema, playbookSchema } from "./playbook.js";
import { playbookEditorialSchema } from "./playbook-editorial.js";
import { sprawlHourTrack, sprawlLineSchema } from "./sprawl-shared.js";

export const theSprawlPlaybookSchema = playbookSchema.extend({
  directives: z.array(nonEmptyString).min(1).meta({ description: "Corporate directives that shape this playbook." }),
  directiveChoices: z.array(advancementEntrySchema).optional().meta({ description: "Directives offered at creation, with the ones chosen." }),
  missionGear: z.array(nonEmptyString).optional().meta({ description: "Gear selected for a mission." }),
  cred: portableCount.optional().meta({ description: "Starting Cred available to the playbook." }),
  characterName: nonEmptyString.optional().meta({ description: "Name written on the sheet by the player." }),
  look: z.array(sprawlLineSchema).optional().meta({ description: "Appearance lines: eyes, face, body, skin, outfit." }),
  cyberware: z.array(advancementEntrySchema).optional().meta({ description: "Implants of the character, with the ones installed." }),
  xp: portableCount.optional().meta({ description: "Experience points currently marked." }),
  xpMax: portableCount.optional().meta({ description: "Experience points needed for the next advancement." }),
  links: z.array(z.strictObject({
    name: nonEmptyString.optional().meta({ description: "Who the link is with." }),
    value: portableInteger.meta({ description: "Signed value of the link." }),
  }).meta({ description: "A link with another character." })).max(6).optional().meta({ description: "The six links printed on the sheet." }),
  contacts: z.array(nonEmptyString).max(5).optional().meta({ description: "The contacts of the character." }),
  ...sprawlHourTrack,
  editorial: playbookEditorialSchema.meta({ description: "Complete editorial copy rendered with the playbook." }),
}).meta({ title: "The Sprawl playbook", description: "Portable single-document representation of a The Sprawl playbook." });
