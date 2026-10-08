import { z } from "zod";

const primitives = ["track", "boxes", "key-value", "list", "prose", "portrait"] as const;
const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);

/**
 * The presentation contract the three Monster of the Week card targets (team, monster, threat)
 * share: a framed card read in bands from top to bottom, one to three columns each, and
 * the prose written under it. Each target publishes its own regions through this builder, so
 * the three schemas stay separate documents with the same closed shape.
 */
export function motwCardPresentationSchema<Target extends string, Id extends string>(
  target: Target,
  ids: readonly [Id, ...Id[]],
) {
  const regionId = z.enum(ids as unknown as [Id, ...Id[]]);
  return z.strictObject({
    target: z.literal(target),
    regions: z.array(z.strictObject({
      id: regionId,
      label: z.string().min(1),
      /** `card` is drawn inside the framed card; `context` is the prose written under it. */
      group: z.enum(["card", "context"]),
      primitive: z.enum(primitives),
      fields: z.array(fieldPath).min(1),
    })).length(ids.length),
    canonicalOrder: z.array(regionId).length(ids.length),
    /** Bands of the card, from top to bottom; one to three columns each. */
    rows: z.array(z.array(z.array(regionId).min(1)).min(1).max(3)).min(1),
    /** Regions deliberately left out of the card, drawn after it. */
    outsideCard: z.array(regionId),
    fallbacks: z.strictObject({
      unplaced: z.literal("canonical-order"),
      narrowPane: z.literal("canonical-flow"),
      print: z.literal("canonical-flow"),
    }),
  }).superRefine((layout, context) => {
    const declared = layout.regions.map((region) => region.id as string);
    const distinct = new Set(declared);
    if (distinct.size !== declared.length) context.addIssue({ code: "custom", message: "regions contain a duplicate id" });
    const canonical = new Set(layout.canonicalOrder as string[]);
    if (canonical.size !== layout.canonicalOrder.length || canonical.size !== distinct.size || [...canonical].some((id) => !distinct.has(id))) {
      context.addIssue({ code: "custom", message: "canonicalOrder must contain every declared region exactly once" });
    }
    const placed = [...layout.rows.flat(2), ...layout.outsideCard] as string[];
    if (new Set(placed).size !== placed.length) context.addIssue({ code: "custom", message: "layout contains a duplicate region" });
    if (placed.some((id) => !canonical.has(id))) context.addIssue({ code: "custom", message: "layout contains an unknown region" });
    const unplaced = layout.regions.filter((region) => !placed.includes(region.id as string));
    if (unplaced.length > 0) {
      context.addIssue({ code: "custom", message: `region left unplaced: ${unplaced.map((region) => region.id).join(", ")}` });
    }
    const group = new Map(layout.regions.map((region) => [region.id as string, region.group]));
    /* A row is one band of the card: the context never shares one, and the card never sits outside. */
    for (const row of layout.rows) {
      if ((row.flat() as string[]).some((id) => group.get(id) !== "card")) {
        context.addIssue({ code: "custom", message: "a row mixes the card with its context" });
      }
    }
    if ((layout.outsideCard as string[]).some((id) => group.get(id) !== "context")) {
      context.addIssue({ code: "custom", message: "outsideCard holds a region of the card" });
    }
  });
}

export type PbtaMonsterOfTheWeekPrimitive = typeof primitives[number];
