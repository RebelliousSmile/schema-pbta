import type { z } from "zod";
import { motwCardPresentationSchema } from "./monster-of-the-week-card.js";

const regionIds = [
  "motw-monster-header",
  "motw-monster-motivation",
  "motw-monster-powers",
  "motw-monster-attacks",
  "motw-monster-harm",
  "motw-monster-weaknesses",
  "motw-monster-context",
] as const;

export const monsterOfTheWeekMonsterPresentationSchema = motwCardPresentationSchema("monster-of-the-week-monster", regionIds);

export type PbtaMonsterOfTheWeekMonsterPresentation = z.infer<typeof monsterOfTheWeekMonsterPresentationSchema>;
export type PbtaMonsterOfTheWeekMonsterRegionId = typeof regionIds[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths; they are bindings,
 * not layout markup, CSS selectors, or runtime component IDs.
 */
export const PBTA_MONSTER_OF_THE_WEEK_MONSTER_PRESENTATION: PbtaMonsterOfTheWeekMonsterPresentation = monsterOfTheWeekMonsterPresentationSchema.parse({
  target: "monster-of-the-week-monster",
  regions: [
    { id: "motw-monster-header", label: "En-tête", group: "card", primitive: "key-value", fields: ["name", "monsterType", "bestiary"] },
    { id: "motw-monster-motivation", label: "Motivation", group: "card", primitive: "prose", fields: ["motivation"] },
    { id: "motw-monster-powers", label: "Pouvoirs", group: "card", primitive: "list", fields: ["powers"] },
    { id: "motw-monster-attacks", label: "Attaques", group: "card", primitive: "list", fields: ["attacks"] },
    { id: "motw-monster-harm", label: "Blessures et armure", group: "card", primitive: "boxes", fields: ["harmCapacity", "harmMarked", "armour", "armourNote"] },
    { id: "motw-monster-weaknesses", label: "Faiblesses", group: "card", primitive: "list", fields: ["weaknesses"] },
    { id: "motw-monster-context", label: "Contexte", group: "context", primitive: "prose", fields: ["description"] },
  ],
  canonicalOrder: [
    "motw-monster-header", "motw-monster-motivation", "motw-monster-powers", "motw-monster-attacks",
    "motw-monster-harm", "motw-monster-weaknesses", "motw-monster-context",
  ],
  rows: [
    [["motw-monster-header"]],
    [["motw-monster-motivation"]],
    [["motw-monster-powers"], ["motw-monster-attacks"]],
    [["motw-monster-harm"], ["motw-monster-weaknesses"]],
  ],
  outsideCard: ["motw-monster-context"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaMonsterOfTheWeekMonsterPresentation(target: string): PbtaMonsterOfTheWeekMonsterPresentation | undefined {
  return target === PBTA_MONSTER_OF_THE_WEEK_MONSTER_PRESENTATION.target ? PBTA_MONSTER_OF_THE_WEEK_MONSTER_PRESENTATION : undefined;
}
