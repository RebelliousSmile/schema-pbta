import type { z } from "zod";
import { motwCardPresentationSchema } from "./monster-of-the-week-card.js";

const regionIds = [
  "motw-threat-header",
  "motw-threat-motivation",
  "motw-threat-stages",
  "motw-threat-powers",
  "motw-threat-attacks",
  "motw-threat-harm",
  "motw-threat-weaknesses",
  "motw-threat-context",
] as const;

export const monsterOfTheWeekThreatPresentationSchema = motwCardPresentationSchema("monster-of-the-week-threat", regionIds);

export type PbtaMonsterOfTheWeekThreatPresentation = z.infer<typeof monsterOfTheWeekThreatPresentationSchema>;
export type PbtaMonsterOfTheWeekThreatRegionId = typeof regionIds[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths; they are bindings,
 * not layout markup, CSS selectors, or runtime component IDs.
 */
export const PBTA_MONSTER_OF_THE_WEEK_THREAT_PRESENTATION: PbtaMonsterOfTheWeekThreatPresentation = monsterOfTheWeekThreatPresentationSchema.parse({
  target: "monster-of-the-week-threat",
  regions: [
    { id: "motw-threat-header", label: "En-tête", group: "card", primitive: "key-value", fields: ["name", "threatType", "mystery"] },
    { id: "motw-threat-motivation", label: "Motivation", group: "card", primitive: "prose", fields: ["motivation"] },
    { id: "motw-threat-stages", label: "Étapes du plan", group: "card", primitive: "boxes", fields: ["stages"] },
    { id: "motw-threat-powers", label: "Pouvoirs", group: "card", primitive: "list", fields: ["powers"] },
    { id: "motw-threat-attacks", label: "Attaques", group: "card", primitive: "list", fields: ["attacks"] },
    { id: "motw-threat-harm", label: "Blessures et armure", group: "card", primitive: "boxes", fields: ["harmCapacity", "harmMarked", "armour", "armourNote"] },
    { id: "motw-threat-weaknesses", label: "Faiblesses", group: "card", primitive: "list", fields: ["weaknesses"] },
    { id: "motw-threat-context", label: "Contexte", group: "context", primitive: "prose", fields: ["description"] },
  ],
  canonicalOrder: [
    "motw-threat-header", "motw-threat-motivation", "motw-threat-stages", "motw-threat-powers",
    "motw-threat-attacks", "motw-threat-harm", "motw-threat-weaknesses", "motw-threat-context",
  ],
  rows: [
    [["motw-threat-header"]],
    [["motw-threat-motivation"]],
    [["motw-threat-stages"]],
    [["motw-threat-powers"], ["motw-threat-attacks"]],
    [["motw-threat-harm"], ["motw-threat-weaknesses"]],
  ],
  outsideCard: ["motw-threat-context"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaMonsterOfTheWeekThreatPresentation(target: string): PbtaMonsterOfTheWeekThreatPresentation | undefined {
  return target === PBTA_MONSTER_OF_THE_WEEK_THREAT_PRESENTATION.target ? PBTA_MONSTER_OF_THE_WEEK_THREAT_PRESENTATION : undefined;
}
