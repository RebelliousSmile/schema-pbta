import type { z } from "zod";
import { sprawlCardPresentationSchema } from "./the-sprawl-card.js";

const regionIds = [
  "sprawl-mission-header",
  "sprawl-mission-investigation",
  "sprawl-mission-action",
  "sprawl-mission-parties",
  "sprawl-mission-security",
  "sprawl-mission-going-on",
  "sprawl-mission-twist",
  "sprawl-mission-directives",
  "sprawl-mission-pay",
] as const;

export const theSprawlMissionPresentationSchema = sprawlCardPresentationSchema("the-sprawl-mission", regionIds);

export type PbtaTheSprawlMissionPresentation = z.infer<typeof theSprawlMissionPresentationSchema>;
export type PbtaTheSprawlMissionRegionId = typeof regionIds[number];

export const PBTA_THE_SPRAWL_MISSION_PRESENTATION: PbtaTheSprawlMissionPresentation = theSprawlMissionPresentationSchema.parse({
  target: "the-sprawl-mission",
  regions: [
    { id: "sprawl-mission-header", label: "Obtenir le taf", group: "card", primitive: "key-value", fields: ["name", "getTheJob"] },
    { id: "sprawl-mission-investigation", label: "Investigation", group: "card", primitive: "hour-track", fields: ["investigation.hoursMarked", "investigation.steps"] },
    { id: "sprawl-mission-action", label: "Action", group: "card", primitive: "hour-track", fields: ["action.hoursMarked", "action.steps"] },
    { id: "sprawl-mission-parties", label: "Parties impliquées", group: "card", primitive: "list", fields: ["involvedParties"] },
    { id: "sprawl-mission-security", label: "Sécurité", group: "card", primitive: "list", fields: ["security"] },
    { id: "sprawl-mission-going-on", label: "Que se passe-t-il ?", group: "card", primitive: "prose", fields: ["whatIsGoingOn"] },
    { id: "sprawl-mission-twist", label: "Retournement de situation ?", group: "card", primitive: "prose", fields: ["twist"] },
    { id: "sprawl-mission-directives", label: "Directives de mission", group: "card", primitive: "cut-corner-card", fields: ["missionDirectives"] },
    { id: "sprawl-mission-pay", label: "Se faire payer", group: "context", primitive: "prose", fields: ["getPaid"] },
  ],
  canonicalOrder: [
    "sprawl-mission-header", "sprawl-mission-investigation", "sprawl-mission-parties", "sprawl-mission-going-on",
    "sprawl-mission-twist", "sprawl-mission-action", "sprawl-mission-security", "sprawl-mission-directives", "sprawl-mission-pay",
  ],
  rows: [
    [["sprawl-mission-header"]],
    [["sprawl-mission-investigation"], ["sprawl-mission-action"]],
    [["sprawl-mission-parties"], ["sprawl-mission-security"]],
    [["sprawl-mission-going-on"], ["sprawl-mission-twist"]],
    [["sprawl-mission-directives"]],
  ],
  outsideCard: ["sprawl-mission-pay"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaTheSprawlMissionPresentation(target: string): PbtaTheSprawlMissionPresentation | undefined {
  return target === PBTA_THE_SPRAWL_MISSION_PRESENTATION.target ? PBTA_THE_SPRAWL_MISSION_PRESENTATION : undefined;
}
