import { z } from "zod";
import { URBAN_SHADOWS_EQUIPMENT_RANGES } from "../zod/urban-shadows-playbook.js";
import { localizedLabelSchema } from "./label.js";

const regionIds = [
  "game-identity",
  "urban-shadows-opening",
  "character-identity",
  "urban-shadows-illustration",
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
  "urban-shadows-notes",
] as const;

/* The last five are proper to this sheet: a Circle with its status marks, a list of boxes to tick, a track of boxes, the picture of the playbook, and the lined area the player writes the notes of the game in. */
const primitives = [
  "identity", "editorial-copy", "stat-spread", "action-list", "relationship-ledger",
  "condition-harm-tracker", "gear-list", "progression-list",
  "circle-status", "check-list", "box-track", "portrait", "notes",
] as const;

const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);
const regionId = z.enum(regionIds);

export const urbanShadowsPlaybookPresentationSchema = z.strictObject({
  target: z.literal("urban-shadows-playbook"),
  regions: z.array(z.strictObject({
    id: regionId,
    /** Printed in both languages: the consumer follows its own interface language. */
    label: localizedLabelSchema,
    /** The face of the printed sheet the region belongs to. */
    group: z.enum(["recto", "verso"]),
    primitive: z.enum(primitives),
    fields: z.array(fieldPath).min(1),
  })).length(regionIds.length),
  canonicalOrder: z.array(regionId).length(regionIds.length),
  rows: z.array(z.array(z.array(regionId).min(1)).min(1).max(3)).min(1),
  /** The gear vocabulary the editor offers. Open: a tag written outside it is valid. */
  equipment: z.strictObject({
    ranges: z.array(z.strictObject({ id: z.enum(URBAN_SHADOWS_EQUIPMENT_RANGES), label: localizedLabelSchema })).length(URBAN_SHADOWS_EQUIPMENT_RANGES.length),
    tags: z.array(z.strictObject({ id: z.string().regex(/^[a-z]+(?: [a-z]+)*(?:-[a-z]+)*$/), label: localizedLabelSchema })).min(1),
  }),
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
  const placed = layout.rows.flat(2);
  if (new Set(placed).size !== placed.length) context.addIssue({ code: "custom", message: "layout contains a duplicate region" });
  if (placed.some((id) => !canonical.has(id))) context.addIssue({ code: "custom", message: "layout contains an unknown region" });
  /* A row is one band of one face: the two faces never share one. */
  const face = new Map(layout.regions.map((region) => [region.id, region.group]));
  for (const row of layout.rows) {
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
    { id: "game-identity", label: { fr: "Archétype", en: "Archetype" }, group: "recto", primitive: "identity", fields: ["name", "characterName", "demeanor", "look", "description"] },
    { id: "urban-shadows-opening", label: { fr: "Introduction", en: "Introduction" }, group: "recto", primitive: "editorial-copy", fields: ["editorial.opening"] },
    { id: "character-identity", label: { fr: "Identité", en: "Identity" }, group: "recto", primitive: "identity", fields: ["editorial.identity"] },
    { id: "urban-shadows-illustration", label: { fr: "Illustration", en: "Illustration" }, group: "verso", primitive: "portrait", fields: ["playbookImage"] },
    { id: "urban-shadows-stats", label: { fr: "Caractéristiques", en: "Stats" }, group: "recto", primitive: "stat-spread", fields: ["stats", "statsDetail"] },
    { id: "urban-shadows-circles", label: { fr: "Cercles", en: "Circles" }, group: "recto", primitive: "circle-status", fields: ["stats", "statuses"] },
    { id: "playbook-moves", label: { fr: "Actions d'archétype", en: "Playbook moves" }, group: "recto", primitive: "action-list", fields: ["moves"] },
    { id: "urban-shadows-advancement", label: { fr: "Progression", en: "Advancement" }, group: "recto", primitive: "progression-list", fields: ["editorial.progression", "advancementCircles", "markedCircles", "advancement", "laterAdvancement"] },
    { id: "harm-tracker", label: { fr: "Blessures", en: "Harm" }, group: "recto", primitive: "condition-harm-tracker", fields: ["harm"] },
    { id: "urban-shadows-scars", label: { fr: "Séquelles", en: "Scars" }, group: "recto", primitive: "check-list", fields: ["scars"] },
    { id: "urban-shadows-let-it-out", label: { fr: "Lâcher la Bête", en: "Let it out" }, group: "recto", primitive: "check-list", fields: ["letItOut"] },
    { id: "urban-shadows-end-move", label: { fr: "Ultime action", en: "End move" }, group: "recto", primitive: "editorial-copy", fields: ["endMove"] },
    { id: "urban-shadows-creation", label: { fr: "Création du personnage", en: "Character creation" }, group: "verso", primitive: "editorial-copy", fields: ["creation", "statProfiles", "choiceSets", "attributes"] },
    { id: "urban-shadows-debts", label: { fr: "Dettes de départ", en: "Starting debts" }, group: "recto", primitive: "relationship-ledger", fields: ["debts"] },
    { id: "urban-shadows-mortal-relationships", label: { fr: "Relations mortelles", en: "Mortal relationships" }, group: "recto", primitive: "relationship-ledger", fields: ["mortalRelationships"] },
    { id: "urban-shadows-extras", label: { fr: "Cadres de l'archétype", en: "Playbook frames" }, group: "recto", primitive: "editorial-copy", fields: ["extras"] },
    { id: "urban-shadows-intimacy", label: { fr: "Intimité", en: "Intimacy" }, group: "recto", primitive: "editorial-copy", fields: ["intimacy"] },
    { id: "gear", label: { fr: "Équipement", en: "Gear" }, group: "verso", primitive: "gear-list", fields: ["gear"] },
    { id: "urban-shadows-corruption", label: { fr: "Corruption", en: "Corruption" }, group: "recto", primitive: "box-track", fields: ["corruption"] },
    { id: "urban-shadows-play", label: { fr: "Jouer l'archétype", en: "Playing the playbook" }, group: "recto", primitive: "editorial-copy", fields: ["editorial.playAdvice"] },
    { id: "urban-shadows-notes", label: { fr: "Notes de partie", en: "Session notes" }, group: "verso", primitive: "notes", fields: ["sessionNotes"] },
  ],
  canonicalOrder: [
    "game-identity", "urban-shadows-opening", "character-identity", "urban-shadows-illustration", "urban-shadows-stats", "urban-shadows-circles",
    "playbook-moves", "urban-shadows-advancement", "harm-tracker", "urban-shadows-scars",
    "urban-shadows-let-it-out", "urban-shadows-end-move",
    "urban-shadows-creation", "urban-shadows-debts", "urban-shadows-mortal-relationships", "urban-shadows-extras",
    "urban-shadows-intimacy", "gear", "urban-shadows-corruption", "urban-shadows-play", "urban-shadows-notes",
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
      ["urban-shadows-illustration", "gear"],
      ["urban-shadows-notes"],
    ],
  ],
  equipment: {
    ranges: [
      { id: "hand", label: { fr: "hand", en: "hand" } },
      { id: "close", label: { fr: "close", en: "close" } },
      { id: "near", label: { fr: "near", en: "near" } },
      { id: "far", label: { fr: "far", en: "far" } },
    ],
    tags: [
      { id: "anchored", label: { fr: "ancré", en: "anchored" } },
      { id: "ap", label: { fr: "perforant", en: "ap" } },
      { id: "area", label: { fr: "zone", en: "area" } },
      { id: "autofire", label: { fr: "tir automatique", en: "autofire" } },
      { id: "booby-trapped", label: { fr: "piégé", en: "booby-trapped" } },
      { id: "cherished", label: { fr: "chéri", en: "cherished" } },
      { id: "cold iron", label: { fr: "fer froid", en: "cold iron" } },
      { id: "concealable", label: { fr: "dissimulable", en: "concealable" } },
      { id: "exhausting", label: { fr: "épuisant", en: "exhausting" } },
      { id: "fire", label: { fr: "feu", en: "fire" } },
      { id: "fragile", label: { fr: "fragile", en: "fragile" } },
      { id: "holy", label: { fr: "sacré", en: "holy" } },
      { id: "loud", label: { fr: "bruyant", en: "loud" } },
      { id: "messy", label: { fr: "salissant", en: "messy" } },
      { id: "mythic", label: { fr: "mythique", en: "mythic" } },
      { id: "reload", label: { fr: "rechargement", en: "reload" } },
      { id: "reputation", label: { fr: "réputation", en: "reputation" } },
      { id: "silver", label: { fr: "argent", en: "silver" } },
      { id: "smoke", label: { fr: "fumée", en: "smoke" } },
      { id: "stun", label: { fr: "étourdissant", en: "stun" } },
    ],
  },
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
