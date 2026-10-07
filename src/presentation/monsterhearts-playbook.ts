import { z } from "zod";

const regionIds = [
  "game-identity",
  "monsterhearts-opening",
  "character-identity",
  "stat-profiles",
  "playbook-portrait",
  "playbook-moves",
  "ascendants-and-conditions",
  "gear",
  "monsterhearts-darkest-self",
  "monsterhearts-sex-move",
  "monsterhearts-play",
  "monsterhearts-progression",
] as const;

const primitives = [
  "identity", "editorial-copy", "stat-spread", "portrait", "action-list", "relationship-ledger",
  "condition-harm-tracker", "gear-list", "progression-list",
] as const;

const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);
const regionId = z.enum(regionIds);

export const monsterheartsPlaybookPresentationSchema = z.strictObject({
  target: z.literal("monsterhearts-playbook"),
  regions: z.array(z.strictObject({
    id: regionId,
    label: z.string().min(1),
    group: z.enum(["identity", "playbook", "relationships", "state", "editorial"]),
    primitive: z.enum(primitives),
    fields: z.array(fieldPath).min(1),
  })).length(regionIds.length),
  canonicalOrder: z.array(regionId).length(regionIds.length),
  columns: z.array(z.array(regionId).min(1)).min(1).optional(),
  rows: z.array(z.array(z.array(regionId).min(1)).length(3)).min(1).optional(),
  fallbacks: z.strictObject({
    unplaced: z.literal("canonical-order"),
    narrowPane: z.literal("canonical-flow"),
    print: z.literal("canonical-flow"),
  }),
  pack: z.strictObject({
    id: z.literal("monsterhearts"),
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
  for (const placed of [layout.columns?.flat() ?? [], layout.rows?.flat(2) ?? []]) {
    if (new Set(placed).size !== placed.length) context.addIssue({ code: "custom", message: "layout contains a duplicate region" });
    if (placed.some((id) => !canonical.has(id))) context.addIssue({ code: "custom", message: "layout contains an unknown region" });
  }
  if (layout.pack.variants[0]?.id !== "base") context.addIssue({ code: "custom", message: "the only pack variant is base" });
});

export type PbtaMonsterheartsPlaybookPresentation = z.infer<typeof monsterheartsPlaybookPresentationSchema>;
export type PbtaMonsterheartsRegionId = typeof regionIds[number];
export type PbtaMonsterheartsPrimitive = typeof primitives[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths;
 * they are bindings, not layout markup, CSS selectors, or runtime component IDs.
 */
export const PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION: PbtaMonsterheartsPlaybookPresentation = monsterheartsPlaybookPresentationSchema.parse({
  target: "monsterhearts-playbook",
  regions: [
    { id: "game-identity", label: "Présentation", group: "identity", primitive: "identity", fields: ["name", "description"] },
    { id: "monsterhearts-opening", label: "Introduction", group: "editorial", primitive: "editorial-copy", fields: ["editorial.opening"] },
    { id: "character-identity", label: "Identité", group: "identity", primitive: "identity", fields: ["editorial.identity", "creation", "backstory"] },
    { id: "stat-profiles", label: "Caractéristiques", group: "identity", primitive: "stat-spread", fields: ["stats", "statRanges", "statProfiles"] },
    { id: "playbook-portrait", label: "Portrait", group: "identity", primitive: "portrait", fields: ["playbookImage"] },
    { id: "playbook-moves", label: "Actions", group: "playbook", primitive: "action-list", fields: ["moves", "startingMoves", "choiceSets"] },
    { id: "ascendants-and-conditions", label: "Ascendants & conditions", group: "relationships", primitive: "relationship-ledger", fields: ["strings", "ascendants", "conditions", "harm"] },
    { id: "gear", label: "Équipement", group: "playbook", primitive: "gear-list", fields: ["gear"] },
    { id: "monsterhearts-darkest-self", label: "Démon intérieur", group: "editorial", primitive: "editorial-copy", fields: ["editorial.darkestSelf"] },
    { id: "monsterhearts-sex-move", label: "Action sexuelle", group: "editorial", primitive: "editorial-copy", fields: ["editorial.sexMove"] },
    { id: "monsterhearts-play", label: "Jouer la mue", group: "editorial", primitive: "editorial-copy", fields: ["editorial.play"] },
    { id: "monsterhearts-progression", label: "Progressions", group: "state", primitive: "progression-list", fields: ["editorial.progression", "advances"] },
  ],
  canonicalOrder: [
    "game-identity", "monsterhearts-opening", "character-identity", "stat-profiles", "playbook-portrait",
    "playbook-moves", "ascendants-and-conditions", "gear",
    "monsterhearts-darkest-self", "monsterhearts-sex-move", "monsterhearts-play", "monsterhearts-progression",
  ],
  rows: [
    [
      ["monsterhearts-opening", "monsterhearts-darkest-self", "monsterhearts-sex-move", "monsterhearts-play", "character-identity"],
      ["playbook-portrait"],
      ["playbook-moves"],
    ],
    [
      ["gear"],
      ["stat-profiles", "ascendants-and-conditions"],
      ["monsterhearts-progression"],
    ],
  ],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
  pack: {
    id: "monsterhearts",
    appearanceArtifact: "appearance-contract.json",
    tokens: ["--monsterhearts-title-font", "--monsterhearts-title-ink", "--pbta-column-gap", "--pbta-column-rule"],
    assets: ["game-mark"],
    variants: [{ id: "base", presentationOnly: true }],
  },
});

export function getPbtaMonsterheartsPlaybookPresentation(
  target: string,
): PbtaMonsterheartsPlaybookPresentation | undefined {
  return target === PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.target
    ? PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION
    : undefined;
}
