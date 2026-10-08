import { z } from "zod";

const regionIds = [
  "masks-header",
  "masks-labels",
  "masks-conditions",
  "masks-moment-of-truth",
  "masks-influence-options",
  "masks-advances",
  "masks-moves",
  "masks-drives",
  "masks-identity",
  "masks-backstory",
  "masks-relationships",
  "masks-influence",
  "masks-illustration",
] as const;

/* Six primitives: a track of values, a list of boxes to tick, key-value lines, a bulleted list, prose, a portrait. */
const primitives = ["track", "boxes", "key-value", "list", "prose", "portrait"] as const;

const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);
const regionId = z.enum(regionIds);
const faceId = z.enum(["recto", "verso"]);

export const masksPlaybookPresentationSchema = z.strictObject({
  target: z.literal("masks-playbook"),
  regions: z.array(z.strictObject({
    id: regionId,
    label: z.string().min(1),
    /** The face of the printed booklet the region belongs to; the header belongs to the front and is drawn on both. */
    group: faceId,
    primitive: z.enum(primitives),
    fields: z.array(fieldPath).min(1),
  })).length(regionIds.length),
  canonicalOrder: z.array(regionId).length(regionIds.length),
  /** The two faces; each stacks two columns of regions under one header region. */
  faces: z.array(z.strictObject({
    id: faceId,
    label: z.string().min(1),
    header: regionId,
    columns: z.array(z.array(regionId).min(1)).length(2),
  })).length(2),
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
  if (new Set(layout.faces.map((face) => face.id)).size !== layout.faces.length) {
    context.addIssue({ code: "custom", message: "faces must name the recto and the verso once each" });
  }
  /* The header is one region drawn on both faces; it is never also placed in a column. */
  const headers = new Set(layout.faces.map((face) => face.header));
  if (headers.size !== 1) context.addIssue({ code: "custom", message: "every face must name the same header region" });
  const placed = layout.faces.flatMap((face) => face.columns.flat());
  if (new Set(placed).size !== placed.length) context.addIssue({ code: "custom", message: "layout contains a duplicate region" });
  if (placed.some((id) => !canonical.has(id))) context.addIssue({ code: "custom", message: "layout contains an unknown region" });
  if (placed.some((id) => headers.has(id))) context.addIssue({ code: "custom", message: "the header region cannot be placed in a column" });
  const unplaced = layout.regions.filter((region) => !placed.includes(region.id) && !headers.has(region.id));
  if (unplaced.length > 0) {
    context.addIssue({ code: "custom", message: `region left unplaced: ${unplaced.map((region) => region.id).join(", ")}` });
  }
  /* A column is one band of one face: a region only appears on the face its group names. */
  const group = new Map(layout.regions.map((region) => [region.id, region.group]));
  for (const face of layout.faces) {
    if (face.columns.flat().some((id) => group.get(id) !== face.id)) {
      context.addIssue({ code: "custom", message: `the ${face.id} face draws a region of the other face` });
    }
  }
});

export type PbtaMasksPlaybookPresentation = z.infer<typeof masksPlaybookPresentationSchema>;
export type PbtaMasksPlaybookRegionId = typeof regionIds[number];
export type PbtaMasksPlaybookPrimitive = typeof primitives[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths;
 * they are bindings, not layout markup, CSS selectors, or runtime component IDs.
 */
export const PBTA_MASKS_PLAYBOOK_PRESENTATION: PbtaMasksPlaybookPresentation = masksPlaybookPresentationSchema.parse({
  target: "masks-playbook",
  regions: [
    { id: "masks-header", label: "En-tête", group: "recto", primitive: "prose", fields: ["name", "heroName", "description"] },
    { id: "masks-labels", label: "Labels", group: "recto", primitive: "track", fields: ["stats", "statRanges"] },
    { id: "masks-conditions", label: "Conditions", group: "recto", primitive: "boxes", fields: ["conditions"] },
    { id: "masks-moment-of-truth", label: "Moment de vérité", group: "recto", primitive: "prose", fields: ["momentOfTruth", "momentUnlocked"] },
    { id: "masks-influence-options", label: "Options d'influence", group: "recto", primitive: "list", fields: ["influenceOptions"] },
    { id: "masks-advances", label: "Progressions et Potentiel", group: "recto", primitive: "boxes", fields: ["advancement", "potential", "potentialMax"] },
    { id: "masks-moves", label: "Moves", group: "recto", primitive: "boxes", fields: ["moves"] },
    { id: "masks-drives", label: "Drives", group: "recto", primitive: "boxes", fields: ["drives.intro", "drives.options"] },
    { id: "masks-identity", label: "Identité", group: "verso", primitive: "key-value", fields: ["realName", "abilities", "demeanor"] },
    { id: "masks-backstory", label: "Passé", group: "verso", primitive: "prose", fields: ["backstory"] },
    { id: "masks-relationships", label: "Relations", group: "verso", primitive: "list", fields: ["relationships"] },
    { id: "masks-influence", label: "Influence", group: "verso", primitive: "list", fields: ["influence"] },
    { id: "masks-illustration", label: "Illustration", group: "verso", primitive: "portrait", fields: ["playbookImage"] },
  ],
  canonicalOrder: [
    "masks-header", "masks-labels", "masks-conditions", "masks-moment-of-truth", "masks-influence-options", "masks-advances",
    "masks-moves", "masks-drives",
    "masks-identity", "masks-backstory", "masks-relationships", "masks-influence", "masks-illustration",
  ],
  faces: [
    {
      id: "recto",
      label: "Recto",
      header: "masks-header",
      columns: [
        ["masks-labels", "masks-conditions", "masks-moment-of-truth", "masks-influence-options", "masks-advances"],
        ["masks-moves", "masks-drives"],
      ],
    },
    {
      id: "verso",
      label: "Verso",
      header: "masks-header",
      columns: [
        ["masks-identity", "masks-backstory", "masks-relationships", "masks-influence"],
        ["masks-illustration"],
      ],
    },
  ],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaMasksPlaybookPresentation(target: string): PbtaMasksPlaybookPresentation | undefined {
  return target === PBTA_MASKS_PLAYBOOK_PRESENTATION.target ? PBTA_MASKS_PLAYBOOK_PRESENTATION : undefined;
}
