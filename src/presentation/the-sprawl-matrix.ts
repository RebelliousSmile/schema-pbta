import type { z } from "zod";
import { sprawlCardPresentationSchema } from "./the-sprawl-card.js";

const regionIds = [
  "sprawl-matrix-header",
  "sprawl-matrix-avatar",
  "sprawl-matrix-console",
  "sprawl-matrix-holds",
  "sprawl-matrix-programs",
] as const;

export const theSprawlMatrixPresentationSchema = sprawlCardPresentationSchema("the-sprawl-matrix", regionIds);

export type PbtaTheSprawlMatrixPresentation = z.infer<typeof theSprawlMatrixPresentationSchema>;
export type PbtaTheSprawlMatrixRegionId = typeof regionIds[number];

export const PBTA_THE_SPRAWL_MATRIX_PRESENTATION: PbtaTheSprawlMatrixPresentation = theSprawlMatrixPresentationSchema.parse({
  target: "the-sprawl-matrix",
  regions: [
    { id: "sprawl-matrix-header", label: "En-tête", group: "card", primitive: "key-value", fields: ["name"] },
    { id: "sprawl-matrix-avatar", label: "Avatar", group: "card", primitive: "cut-corner-card", fields: ["avatarDescription", "avatarImage"] },
    { id: "sprawl-matrix-console", label: "Console cybernétique", group: "card", primitive: "hexagon", fields: ["resistance", "firewall", "stealth", "processor"] },
    { id: "sprawl-matrix-holds", label: "Retenues", group: "card", primitive: "boxes", fields: ["holds"] },
    { id: "sprawl-matrix-programs", label: "Programmes", group: "card", primitive: "boxes", fields: ["programs"] },
  ],
  canonicalOrder: [
    "sprawl-matrix-header", "sprawl-matrix-avatar", "sprawl-matrix-console", "sprawl-matrix-holds", "sprawl-matrix-programs",
  ],
  rows: [
    [["sprawl-matrix-header"]],
    [["sprawl-matrix-avatar"], ["sprawl-matrix-console"]],
    [["sprawl-matrix-holds"], ["sprawl-matrix-programs"]],
  ],
  outsideCard: [],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaTheSprawlMatrixPresentation(target: string): PbtaTheSprawlMatrixPresentation | undefined {
  return target === PBTA_THE_SPRAWL_MATRIX_PRESENTATION.target ? PBTA_THE_SPRAWL_MATRIX_PRESENTATION : undefined;
}
