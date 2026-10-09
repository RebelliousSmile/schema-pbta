import type { z } from "zod";
import { sprawlCardPresentationSchema } from "./the-sprawl-card.js";

const regionIds = [
  "sprawl-threat-header",
  "sprawl-threat-objective",
  "sprawl-threat-clock",
  "sprawl-threat-context",
] as const;

export const theSprawlThreatPresentationSchema = sprawlCardPresentationSchema("the-sprawl-threat", regionIds);

export type PbtaTheSprawlThreatPresentation = z.infer<typeof theSprawlThreatPresentationSchema>;
export type PbtaTheSprawlThreatRegionId = typeof regionIds[number];

export const PBTA_THE_SPRAWL_THREAT_PRESENTATION: PbtaTheSprawlThreatPresentation = theSprawlThreatPresentationSchema.parse({
  target: "the-sprawl-threat",
  regions: [
    { id: "sprawl-threat-header", label: "En-tête", group: "card", primitive: "key-value", fields: ["name", "threatType"] },
    { id: "sprawl-threat-objective", label: "Objectif", group: "card", primitive: "prose", fields: ["objective"] },
    { id: "sprawl-threat-clock", label: "Compte à rebours", group: "card", primitive: "hour-track", fields: ["hoursMarked"] },
    { id: "sprawl-threat-context", label: "Description", group: "context", primitive: "prose", fields: ["description"] },
  ],
  canonicalOrder: ["sprawl-threat-header", "sprawl-threat-objective", "sprawl-threat-clock", "sprawl-threat-context"],
  rows: [
    [["sprawl-threat-header"]],
    [["sprawl-threat-objective"], ["sprawl-threat-clock"]],
  ],
  outsideCard: ["sprawl-threat-context"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaTheSprawlThreatPresentation(target: string): PbtaTheSprawlThreatPresentation | undefined {
  return target === PBTA_THE_SPRAWL_THREAT_PRESENTATION.target ? PBTA_THE_SPRAWL_THREAT_PRESENTATION : undefined;
}
