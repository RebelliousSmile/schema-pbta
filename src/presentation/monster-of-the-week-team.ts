import type { z } from "zod";
import { motwCardPresentationSchema } from "./monster-of-the-week-card.js";

const regionIds = [
  "motw-team-header",
  "motw-team-getting-started",
  "motw-team-setup",
  "motw-team-enemies",
  "motw-team-allies",
  "motw-team-maneuvers",
  "motw-team-assets",
  "motw-team-improvement",
  "motw-team-style",
  "motw-team-context",
] as const;

export const monsterOfTheWeekTeamPresentationSchema = motwCardPresentationSchema("monster-of-the-week-team", regionIds);

export type PbtaMonsterOfTheWeekTeamPresentation = z.infer<typeof monsterOfTheWeekTeamPresentationSchema>;
export type PbtaMonsterOfTheWeekTeamRegionId = typeof regionIds[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths; they are bindings,
 * not layout markup, CSS selectors, or runtime component IDs.
 */
export const PBTA_MONSTER_OF_THE_WEEK_TEAM_PRESENTATION: PbtaMonsterOfTheWeekTeamPresentation = monsterOfTheWeekTeamPresentationSchema.parse({
  target: "monster-of-the-week-team",
  regions: [
    { id: "motw-team-header", label: "En-tête", group: "card", primitive: "prose", fields: ["name", "quote"] },
    { id: "motw-team-getting-started", label: "Pour commencer", group: "card", primitive: "list", fields: ["gettingStarted"] },
    { id: "motw-team-setup", label: "Mise en place", group: "card", primitive: "list", fields: ["setup"] },
    { id: "motw-team-enemies", label: "Ennemis", group: "card", primitive: "boxes", fields: ["enemies"] },
    { id: "motw-team-allies", label: "Alliés", group: "card", primitive: "boxes", fields: ["allies"] },
    { id: "motw-team-maneuvers", label: "Manœuvres", group: "card", primitive: "boxes", fields: ["maneuvers"] },
    { id: "motw-team-assets", label: "Atouts", group: "card", primitive: "boxes", fields: ["assets"] },
    { id: "motw-team-improvement", label: "Amélioration", group: "card", primitive: "boxes", fields: ["improvement", "improvementMax", "improvementMarked"] },
    { id: "motw-team-style", label: "Style", group: "card", primitive: "boxes", fields: ["style"] },
    { id: "motw-team-context", label: "Contexte", group: "context", primitive: "prose", fields: ["description"] },
  ],
  canonicalOrder: [
    "motw-team-header", "motw-team-getting-started", "motw-team-setup", "motw-team-enemies", "motw-team-allies",
    "motw-team-maneuvers", "motw-team-assets", "motw-team-improvement", "motw-team-style", "motw-team-context",
  ],
  rows: [
    [["motw-team-header"]],
    [["motw-team-getting-started"], ["motw-team-setup"]],
    [["motw-team-enemies"], ["motw-team-allies"]],
    [["motw-team-maneuvers"], ["motw-team-assets"]],
    [["motw-team-improvement"], ["motw-team-style"]],
  ],
  outsideCard: ["motw-team-context"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaMonsterOfTheWeekTeamPresentation(target: string): PbtaMonsterOfTheWeekTeamPresentation | undefined {
  return target === PBTA_MONSTER_OF_THE_WEEK_TEAM_PRESENTATION.target ? PBTA_MONSTER_OF_THE_WEEK_TEAM_PRESENTATION : undefined;
}
