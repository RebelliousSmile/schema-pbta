import { z } from "zod";

const regionIds = [
  "game-identity",
  "urban-shadows-opening",
  "character-identity",
  "urban-shadows-stats",
  "urban-shadows-circles",
  "playbook-moves",
  "urban-shadows-advancement",
  "harm-tracker",
  "urban-shadows-scars",
  "urban-shadows-let-it-out",
  "urban-shadows-end-move",
  "urban-shadows-creation",
  "urban-shadows-debts",
  "urban-shadows-mortal-relationships",
  "urban-shadows-extras",
  "urban-shadows-intimacy",
  "gear",
  "urban-shadows-corruption",
  "urban-shadows-play",
] as const;

/* The last three are proper to this sheet: a Circle with its status marks, a list of boxes to tick, a track of boxes. */
const primitives = [
  "identity", "editorial-copy", "stat-spread", "action-list", "relationship-ledger",
  "condition-harm-tracker", "gear-list", "progression-list",
  "circle-status", "check-list", "box-track",
] as const;

const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);
const regionId = z.enum(regionIds);

export const urbanShadowsPlaybookPresentationSchema = z.strictObject({
  target: z.literal("urban-shadows-playbook"),
  regions: z.array(z.strictObject({
    id: regionId,
    label: z.string().min(1),
    /** The face of the printed sheet the region belongs to. */
    group: z.enum(["recto", "verso"]),
    primitive: z.enum(primitives),
    fields: z.array(fieldPath).min(1),
  })).length(regionIds.length),
  canonicalOrder: z.array(regionId).length(regionIds.length),
  rows: z.array(z.array(z.array(regionId).min(1)).min(1).max(3)).min(1).optional(),
  fallbacks: z.strictObject({
    unplaced: z.literal("canonical-order"),
    narrowPane: z.literal("canonical-flow"),
    print: z.literal("canonical-flow"),
  }),
  pack: z.strictObject({
    id: z.literal("urban-shadows"),
    appearanceArtifact: z.literal("appearance-contract.json"),
    tokens: z.array(z.string().regex(/^--[a-z0-9-]+$/)).min(1),
    assets: z.array(z.enum(["game-mark"])).min(1),
    variants: z.array(z.strictObject({
      id: z.enum(["base"]),
      presentationOnly: z.literal(true),
    })).length(1),
  }),
}).superRefine((layout, context) => {
  const ids = layout.regions.map((region) => region.id);
  const distinct = new Set(ids);
  if (distinct.size !== ids.length) context.addIssue({ code: "custom", message: "regions contain a duplicate id" });
  const canonical = new Set(layout.canonicalOrder);
  if (canonical.size !== layout.canonicalOrder.length || canonical.size !== distinct.size || [...canonical].some((id) => !distinct.has(id))) {
    context.addIssue({ code: "custom", message: "canonicalOrder must contain every declared region exactly once" });
  }
  const placed = layout.rows?.flat(2) ?? [];
  if (new Set(placed).size !== placed.length) context.addIssue({ code: "custom", message: "layout contains a duplicate region" });
  if (placed.some((id) => !canonical.has(id))) context.addIssue({ code: "custom", message: "layout contains an unknown region" });
  /* A row is one band of one face: the two faces never share one. */
  const face = new Map(layout.regions.map((region) => [region.id, region.group]));
  for (const row of layout.rows ?? []) {
    if (new Set(row.flat().map((id) => face.get(id))).size > 1) {
      context.addIssue({ code: "custom", message: "a row mixes the two faces of the sheet" });
    }
  }
});

export type PbtaUrbanShadowsPlaybookPresentation = z.infer<typeof urbanShadowsPlaybookPresentationSchema>;
export type PbtaUrbanShadowsRegionId = typeof regionIds[number];
export type PbtaUrbanShadowsPrimitive = typeof primitives[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths;
 * they are bindings, not layout markup, CSS selectors, or runtime component IDs.
 */
export const PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION: PbtaUrbanShadowsPlaybookPresentation = urbanShadowsPlaybookPresentationSchema.parse({
  target: "urban-shadows-playbook",
  regions: [
    { id: "game-identity", label: "Archétype", group: "recto", primitive: "identity", fields: ["name", "description", "playbookImage"] },
    { id: "urban-shadows-opening", label: "Introduction", group: "recto", primitive: "editorial-copy", fields: ["editorial.opening"] },
    { id: "character-identity", label: "Identité", group: "recto", primitive: "identity", fields: ["editorial.identity"] },
    { id: "urban-shadows-stats", label: "Caractéristiques", group: "recto", primitive: "stat-spread", fields: ["stats", "statsDetail"] },
    { id: "urban-shadows-circles", label: "Cercles", group: "recto", primitive: "circle-status", fields: ["stats", "statuses"] },
    { id: "playbook-moves", label: "Mouvements d'archétype", group: "recto", primitive: "action-list", fields: ["moves", "startingMoves"] },
    { id: "urban-shadows-advancement", label: "Progression", group: "recto", primitive: "progression-list", fields: ["editorial.progression", "advancementCircles", "advancement", "laterAdvancement"] },
    { id: "harm-tracker", label: "Dégâts", group: "recto", primitive: "condition-harm-tracker", fields: ["harm"] },
    { id: "urban-shadows-scars", label: "Cicatrices", group: "recto", primitive: "check-list", fields: ["scars"] },
    { id: "urban-shadows-let-it-out", label: "Laisse sortir", group: "recto", primitive: "check-list", fields: ["letItOut"] },
    { id: "urban-shadows-end-move", label: "Mouvement final", group: "recto", primitive: "editorial-copy", fields: ["endMove"] },
    { id: "urban-shadows-creation", label: "Création du personnage", group: "verso", primitive: "editorial-copy", fields: ["creation", "statProfiles", "choiceSets", "attributes"] },
    { id: "urban-shadows-debts", label: "Dettes de départ", group: "recto", primitive: "relationship-ledger", fields: ["debts"] },
    { id: "urban-shadows-mortal-relationships", label: "Relations mortelles", group: "recto", primitive: "relationship-ledger", fields: ["mortalRelationships"] },
    { id: "urban-shadows-extras", label: "Cadres de l'archétype", group: "recto", primitive: "editorial-copy", fields: ["extras"] },
    { id: "urban-shadows-intimacy", label: "Intimité", group: "recto", primitive: "editorial-copy", fields: ["intimacy"] },
    { id: "gear", label: "Équipement & notes", group: "verso", primitive: "gear-list", fields: ["gear"] },
    { id: "urban-shadows-corruption", label: "Corruption", group: "recto", primitive: "box-track", fields: ["corruption"] },
    { id: "urban-shadows-play", label: "Jouer l'archétype", group: "recto", primitive: "editorial-copy", fields: ["editorial.playAdvice"] },
  ],
  canonicalOrder: [
    "game-identity", "urban-shadows-opening", "character-identity", "urban-shadows-stats", "urban-shadows-circles",
    "playbook-moves", "urban-shadows-advancement", "harm-tracker", "urban-shadows-scars",
    "urban-shadows-let-it-out", "urban-shadows-end-move",
    "urban-shadows-creation", "urban-shadows-debts", "urban-shadows-mortal-relationships", "urban-shadows-extras",
    "urban-shadows-intimacy", "gear", "urban-shadows-corruption", "urban-shadows-play",
  ],
  rows: [
    [
      ["urban-shadows-opening", "character-identity"],
      ["urban-shadows-stats", "urban-shadows-circles"],
      ["harm-tracker", "urban-shadows-scars"],
    ],
    [
      ["playbook-moves"],
      ["urban-shadows-advancement", "urban-shadows-let-it-out", "urban-shadows-end-move", "urban-shadows-intimacy", "urban-shadows-corruption"],
      ["urban-shadows-debts", "urban-shadows-mortal-relationships", "urban-shadows-extras", "urban-shadows-play"],
    ],
    [
      ["gear"],
    ],
  ],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
  pack: {
    id: "urban-shadows",
    appearanceArtifact: "appearance-contract.json",
    tokens: ["--urban-shadows-title-font", "--urban-shadows-brush-font", "--urban-shadows-accent", "--pbta-column-gap", "--pbta-column-rule"],
    assets: ["game-mark"],
    variants: [{ id: "base", presentationOnly: true }],
  },
});

export function getPbtaUrbanShadowsPlaybookPresentation(
  target: string,
): PbtaUrbanShadowsPlaybookPresentation | undefined {
  return target === PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION.target
    ? PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION
    : undefined;
}
