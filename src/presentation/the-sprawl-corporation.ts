import type { z } from "zod";
import { sprawlCardPresentationSchema } from "./the-sprawl-card.js";

const regionIds = [
  "sprawl-corporation-header",
  "sprawl-corporation-clock",
  "sprawl-corporation-expertise",
  "sprawl-corporation-moves",
  "sprawl-corporation-context",
] as const;

export const theSprawlCorporationPresentationSchema = sprawlCardPresentationSchema("the-sprawl-corporation", regionIds);

export type PbtaTheSprawlCorporationPresentation = z.infer<typeof theSprawlCorporationPresentationSchema>;
export type PbtaTheSprawlCorporationRegionId = typeof regionIds[number];

export const PBTA_THE_SPRAWL_CORPORATION_PRESENTATION: PbtaTheSprawlCorporationPresentation = theSprawlCorporationPresentationSchema.parse({
  target: "the-sprawl-corporation",
  regions: [
    { id: "sprawl-corporation-header", label: "En-tête", group: "card", primitive: "key-value", fields: ["name"] },
    { id: "sprawl-corporation-clock", label: "Compte à rebours", group: "card", primitive: "hour-track", fields: ["hoursMarked"] },
    { id: "sprawl-corporation-expertise", label: "Domaines d'expertise", group: "card", primitive: "list", fields: ["expertise"] },
    { id: "sprawl-corporation-moves", label: "Manœuvres personnalisées", group: "card", primitive: "list", fields: ["customMoves"] },
    { id: "sprawl-corporation-context", label: "Description", group: "context", primitive: "prose", fields: ["description"] },
  ],
  canonicalOrder: [
    "sprawl-corporation-header", "sprawl-corporation-clock", "sprawl-corporation-expertise",
    "sprawl-corporation-moves", "sprawl-corporation-context",
  ],
  rows: [
    [["sprawl-corporation-header"]],
    [["sprawl-corporation-clock"]],
    [["sprawl-corporation-expertise"], ["sprawl-corporation-moves"]],
  ],
  outsideCard: ["sprawl-corporation-context"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaTheSprawlCorporationPresentation(target: string): PbtaTheSprawlCorporationPresentation | undefined {
  return target === PBTA_THE_SPRAWL_CORPORATION_PRESENTATION.target ? PBTA_THE_SPRAWL_CORPORATION_PRESENTATION : undefined;
}
