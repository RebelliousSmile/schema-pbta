import { z } from "zod";
import { localizedLabelSchema } from "./label.js";

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
  "harm-tracker",
  "monsterhearts-notes",
] as const;

const primitives = [
  "identity", "editorial-copy", "stat-spread", "portrait", "action-list", "relationship-ledger",
  "condition-harm-tracker", "gear-list", "progression-list", "notes",
] as const;

const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);
const regionId = z.enum(regionIds);

export const monsterheartsPlaybookPresentationSchema = z.strictObject({
  target: z.literal("monsterhearts-playbook"),
  regions: z.array(z.strictObject({
    id: regionId,
    /** Printed in both languages: the consumer follows its own interface language. */
    label: localizedLabelSchema,
    /** The printed page the region belongs to: `notes` is the back of the sheet. */
    group: z.enum(["identity", "playbook", "relationships", "state", "editorial", "notes"]),
    primitive: z.enum(primitives),
    fields: z.array(fieldPath).min(1),
  })).length(regionIds.length),
  canonicalOrder: z.array(regionId).length(regionIds.length),
  rows: z.array(z.array(z.array(regionId).min(1)).min(1).max(3)).min(1),
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
  const placed = layout.rows.flat(2);
  if (new Set(placed).size !== placed.length) context.addIssue({ code: "custom", message: "layout contains a duplicate region" });
  if (placed.some((id) => !canonical.has(id))) context.addIssue({ code: "custom", message: "layout contains an unknown region" });
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
    { id: "game-identity", label: { fr: "Présentation", en: "Overview" }, group: "identity", primitive: "identity", fields: ["name", "description"] },
    { id: "monsterhearts-opening", label: { fr: "Introduction", en: "Introduction" }, group: "editorial", primitive: "editorial-copy", fields: ["editorial.opening"] },
    { id: "character-identity", label: { fr: "Identité", en: "Identity" }, group: "identity", primitive: "identity", fields: ["editorial.identity", "creation", "backstory"] },
    { id: "stat-profiles", label: { fr: "Caractéristiques", en: "Stats" }, group: "identity", primitive: "stat-spread", fields: ["stats", "statRanges", "statProfiles"] },
    { id: "playbook-portrait", label: { fr: "Portrait", en: "Portrait" }, group: "identity", primitive: "portrait", fields: ["playbookImage"] },
    { id: "playbook-moves", label: { fr: "Actions", en: "Moves" }, group: "playbook", primitive: "action-list", fields: ["moves", "startingMoves"] },
    { id: "ascendants-and-conditions", label: { fr: "Ascendants & conditions", en: "Strings & conditions" }, group: "relationships", primitive: "relationship-ledger", fields: ["strings", "ascendants", "conditions"] },
    { id: "gear", label: { fr: "Équipement", en: "Gear" }, group: "playbook", primitive: "gear-list", fields: ["gear"] },
    { id: "monsterhearts-darkest-self", label: { fr: "Démon intérieur", en: "Darkest Self" }, group: "editorial", primitive: "editorial-copy", fields: ["editorial.darkestSelf"] },
    { id: "monsterhearts-sex-move", label: { fr: "Action sexuelle", en: "Sex move" }, group: "editorial", primitive: "editorial-copy", fields: ["editorial.sexMove"] },
    { id: "monsterhearts-play", label: { fr: "Jouer la mue", en: "Playing the skin" }, group: "editorial", primitive: "editorial-copy", fields: ["editorial.play"] },
    { id: "monsterhearts-progression", label: { fr: "Progressions", en: "Advances" }, group: "state", primitive: "progression-list", fields: ["editorial.progression", "advances"] },
    { id: "harm-tracker", label: { fr: "Dégâts", en: "Harm" }, group: "state", primitive: "condition-harm-tracker", fields: ["harm"] },
    { id: "monsterhearts-notes", label: { fr: "Notes de partie", en: "Session notes" }, group: "notes", primitive: "notes", fields: ["sessionNotes"] },
  ],
  canonicalOrder: [
    "game-identity", "monsterhearts-opening", "character-identity", "stat-profiles", "playbook-portrait",
    "playbook-moves", "ascendants-and-conditions", "gear",
    "monsterhearts-darkest-self", "monsterhearts-sex-move", "monsterhearts-play", "monsterhearts-progression", "harm-tracker", "monsterhearts-notes",
  ],
  rows: [
    [
      ["monsterhearts-opening", "monsterhearts-darkest-self", "monsterhearts-sex-move"],
      ["playbook-portrait"],
      ["monsterhearts-play"],
    ],
    [
      ["playbook-moves", "gear"],
      ["character-identity", "stat-profiles", "ascendants-and-conditions"],
      ["monsterhearts-progression", "harm-tracker"],
    ],
    [
      ["monsterhearts-notes"],
    ],
  ],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
  pack: {
    id: "monsterhearts",
    appearanceArtifact: "appearance-contract.json",
    tokens: ["--monsterhearts-title-font", "--monsterhearts-script-font", "--monsterhearts-title-ink", "--pbta-column-gap", "--pbta-column-rule"],
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
