import type { z } from "zod";
import { sprawlCardPresentationSchema } from "./the-sprawl-card.js";

const regionIds = [
  "sprawl-resource-header",
  "sprawl-resource-skills",
  "sprawl-resource-context",
] as const;

export const theSprawlResourcePresentationSchema = sprawlCardPresentationSchema("the-sprawl-resource", regionIds);

export type PbtaTheSprawlResourcePresentation = z.infer<typeof theSprawlResourcePresentationSchema>;
export type PbtaTheSprawlResourceRegionId = typeof regionIds[number];

export const PBTA_THE_SPRAWL_RESOURCE_PRESENTATION: PbtaTheSprawlResourcePresentation = theSprawlResourcePresentationSchema.parse({
  target: "the-sprawl-resource",
  regions: [
    { id: "sprawl-resource-header", label: "Ressource", group: "card", primitive: "cut-corner-card", fields: ["name", "tags"] },
    { id: "sprawl-resource-skills", label: "Compétences et historique", group: "card", primitive: "list", fields: ["skills"] },
    { id: "sprawl-resource-context", label: "Description", group: "context", primitive: "prose", fields: ["description"] },
  ],
  canonicalOrder: ["sprawl-resource-header", "sprawl-resource-skills", "sprawl-resource-context"],
  rows: [
    [["sprawl-resource-header"]],
    [["sprawl-resource-skills"]],
  ],
  outsideCard: ["sprawl-resource-context"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaTheSprawlResourcePresentation(target: string): PbtaTheSprawlResourcePresentation | undefined {
  return target === PBTA_THE_SPRAWL_RESOURCE_PRESENTATION.target ? PBTA_THE_SPRAWL_RESOURCE_PRESENTATION : undefined;
}
