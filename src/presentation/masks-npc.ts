import { z } from "zod";

const regionIds = [
  "masks-npc-header",
  "masks-npc-identity",
  "masks-npc-resistance",
  "masks-npc-self",
  "masks-npc-worst-self",
  "masks-npc-best-self",
  "masks-npc-moves",
  "masks-npc-context",
] as const;

const primitives = ["track", "boxes", "key-value", "list", "prose", "portrait"] as const;

const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);
const regionId = z.enum(regionIds);

export const masksNpcPresentationSchema = z.strictObject({
  target: z.literal("masks-npc"),
  regions: z.array(z.strictObject({
    id: regionId,
    label: z.string().min(1),
    /** `card` is drawn inside the framed card; `context` is the prose written under it. */
    group: z.enum(["card", "context"]),
    primitive: z.enum(primitives),
    fields: z.array(fieldPath).min(1),
  })).length(regionIds.length),
  canonicalOrder: z.array(regionId).length(regionIds.length),
  /** Bands of the card, from top to bottom; one to three columns each. */
  rows: z.array(z.array(z.array(regionId).min(1)).min(1).max(3)).min(1),
  /** Regions deliberately left out of the card, drawn after it. */
  outsideCard: z.array(regionId).min(1),
  fallbacks: z.strictObject({
    unplaced: z.literal("canonical-order"),
    narrowPane: z.literal("canonical-flow"),
    print: z.literal("canonical-flow"),
  }),
}).superRefine((layout, context) => {
  const ids = layout.regions.map((region) => region.id);
  const distinct = new Set(ids);
  if (distinct.size !== ids.length) context.addIssue({ code: "custom", message: "regions contain a duplicate id" });
  const canonical = new Set(layout.canonicalOrder);
  if (canonical.size !== layout.canonicalOrder.length || canonical.size !== distinct.size || [...canonical].some((id) => !distinct.has(id))) {
    context.addIssue({ code: "custom", message: "canonicalOrder must contain every declared region exactly once" });
  }
  const placed = [...layout.rows.flat(2), ...layout.outsideCard];
  if (new Set(placed).size !== placed.length) context.addIssue({ code: "custom", message: "layout contains a duplicate region" });
  if (placed.some((id) => !canonical.has(id))) context.addIssue({ code: "custom", message: "layout contains an unknown region" });
  const unplaced = layout.regions.filter((region) => !placed.includes(region.id));
  if (unplaced.length > 0) {
    context.addIssue({ code: "custom", message: `region left unplaced: ${unplaced.map((region) => region.id).join(", ")}` });
  }
  const group = new Map(layout.regions.map((region) => [region.id, region.group]));
  /* A row is one band of the card: the context never shares one, and the card never sits outside. */
  for (const row of layout.rows) {
    if (row.flat().some((id) => group.get(id) !== "card")) {
      context.addIssue({ code: "custom", message: "a row mixes the card with its context" });
    }
  }
  if (layout.outsideCard.some((id) => group.get(id) !== "context")) {
    context.addIssue({ code: "custom", message: "outsideCard holds a region of the card" });
  }
});

export type PbtaMasksNpcPresentation = z.infer<typeof masksNpcPresentationSchema>;
export type PbtaMasksNpcRegionId = typeof regionIds[number];
export type PbtaMasksNpcPrimitive = typeof primitives[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths;
 * they are bindings, not layout markup, CSS selectors, or runtime component IDs.
 * The card has no illustration region: the schema has no image field, the note embeds the picture.
 */
export const PBTA_MASKS_NPC_PRESENTATION: PbtaMasksNpcPresentation = masksNpcPresentationSchema.parse({
  target: "masks-npc",
  regions: [
    { id: "masks-npc-header", label: "En-tête", group: "card", primitive: "key-value", fields: ["name", "generation"] },
    { id: "masks-npc-identity", label: "Identité", group: "card", primitive: "key-value", fields: ["realName", "drive", "abilities"] },
    { id: "masks-npc-resistance", label: "Résistance et Conditions", group: "card", primitive: "key-value", fields: ["resistance", "conditions"] },
    { id: "masks-npc-self", label: "Self", group: "card", primitive: "track", fields: ["self"] },
    { id: "masks-npc-worst-self", label: "Pire soi", group: "card", primitive: "prose", fields: ["worstSelf"] },
    { id: "masks-npc-best-self", label: "Meilleur soi", group: "card", primitive: "prose", fields: ["bestSelf"] },
    { id: "masks-npc-moves", label: "Moves", group: "card", primitive: "list", fields: ["moves"] },
    { id: "masks-npc-context", label: "Contexte", group: "context", primitive: "prose", fields: ["description"] },
  ],
  canonicalOrder: [
    "masks-npc-header", "masks-npc-identity", "masks-npc-resistance", "masks-npc-self",
    "masks-npc-worst-self", "masks-npc-best-self", "masks-npc-moves", "masks-npc-context",
  ],
  rows: [
    [["masks-npc-header"]],
    [["masks-npc-identity"]],
    [["masks-npc-resistance"]],
    [["masks-npc-self"]],
    [["masks-npc-worst-self"], ["masks-npc-best-self"]],
    [["masks-npc-moves"]],
  ],
  outsideCard: ["masks-npc-context"],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaMasksNpcPresentation(target: string): PbtaMasksNpcPresentation | undefined {
  return target === PBTA_MASKS_NPC_PRESENTATION.target ? PBTA_MASKS_NPC_PRESENTATION : undefined;
}
