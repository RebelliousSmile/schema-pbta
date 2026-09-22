import { z } from "zod";

const regionIds = [
  "game-identity",
  "monsterhearts-opening",
  "character-identity",
  "stat-profiles",
  "playbook-portrait",
  "playbook-moves",
  "relationships",
  "conditions-and-harm",
  "gear",
  "monsterhearts-darkest-self",
  "monsterhearts-sex-move",
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
    tokens: z.array(z.string().regex(/^--[a-z0-9-]+$/)).min(1),
    assets: z.array(z.enum(["game-mark", "variant-mark"])).min(1),
    variants: z.array(z.strictObject({
      id: z.enum(["base", "drowned-lake"]),
      presentationOnly: z.literal(true),
    })).length(2),
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
  const variants = layout.pack.variants.map((variant) => variant.id);
  if (variants.join(",") !== "base,drowned-lake") context.addIssue({ code: "custom", message: "pack variants must be base then drowned-lake" });
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
    { id: "game-identity", group: "identity", primitive: "identity", fields: ["name", "description"] },
    { id: "monsterhearts-opening", group: "editorial", primitive: "editorial-copy", fields: ["editorial.opening"] },
    { id: "character-identity", group: "identity", primitive: "identity", fields: ["editorial.identity", "creation", "backstory"] },
    { id: "stat-profiles", group: "identity", primitive: "stat-spread", fields: ["stats", "statRanges", "statProfiles"] },
    { id: "playbook-portrait", group: "identity", primitive: "portrait", fields: ["playbookImage"] },
    { id: "playbook-moves", group: "playbook", primitive: "action-list", fields: ["moves", "startingMoves", "choiceSets"] },
    { id: "relationships", group: "relationships", primitive: "relationship-ledger", fields: ["strings", "ascendants"] },
    { id: "conditions-and-harm", group: "state", primitive: "condition-harm-tracker", fields: ["conditions", "harm"] },
    { id: "gear", group: "playbook", primitive: "gear-list", fields: ["gear"] },
    { id: "monsterhearts-darkest-self", group: "editorial", primitive: "editorial-copy", fields: ["editorial.darkestSelf"] },
    { id: "monsterhearts-sex-move", group: "editorial", primitive: "editorial-copy", fields: ["editorial.sexMove"] },
    { id: "monsterhearts-progression", group: "state", primitive: "progression-list", fields: ["editorial.progression", "advances"] },
  ],
  canonicalOrder: [
    "game-identity", "monsterhearts-opening", "character-identity", "stat-profiles", "playbook-portrait",
    "playbook-moves", "relationships", "conditions-and-harm", "gear",
    "monsterhearts-darkest-self", "monsterhearts-sex-move", "monsterhearts-progression",
  ],
  rows: [
    [
      ["monsterhearts-opening", "monsterhearts-darkest-self", "monsterhearts-sex-move"],
      ["playbook-portrait"],
      ["playbook-moves"],
    ],
    [
      ["conditions-and-harm", "gear"],
      ["character-identity", "stat-profiles", "relationships"],
      ["monsterhearts-progression"],
    ],
  ],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
  pack: {
    id: "monsterhearts",
    tokens: ["--monsterhearts-title-font", "--monsterhearts-title-ink", "--pbta-column-gap", "--pbta-column-rule"],
    assets: ["game-mark", "variant-mark"],
    variants: [{ id: "base", presentationOnly: true }, { id: "drowned-lake", presentationOnly: true }],
  },
});

export function getPbtaMonsterheartsPlaybookPresentation(
  target: string,
): PbtaMonsterheartsPlaybookPresentation | undefined {
  return target === PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.target
    ? PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION
    : undefined;
}
