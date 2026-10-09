import { z } from "zod";
import { SPRAWL_PRIMITIVES } from "./the-sprawl-card.js";

const regionIds = [
  "sprawl-header",
  "sprawl-look",
  "sprawl-gear",
  "sprawl-cyberware",
  "sprawl-moves",
  "sprawl-stats",
  "sprawl-cred-xp",
  "sprawl-directives",
  "sprawl-advancement",
  "sprawl-links",
  "sprawl-contacts",
  "sprawl-harm",
] as const;

const fieldPath = z.string().regex(/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*$/);
const regionId = z.enum(regionIds);
const faceId = z.enum(["recto", "verso"]);

export const theSprawlPlaybookPresentationSchema = z.strictObject({
  target: z.literal("the-sprawl-playbook"),
  regions: z.array(z.strictObject({
    id: regionId,
    label: z.string().min(1),
    /** The face of the printed booklet the region belongs to; the header belongs to the front and is drawn on both. */
    group: faceId,
    primitive: z.enum(SPRAWL_PRIMITIVES),
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
  const group = new Map(layout.regions.map((region) => [region.id, region.group]));
  for (const face of layout.faces) {
    if (face.columns.flat().some((id) => group.get(id) !== face.id)) {
      context.addIssue({ code: "custom", message: `the ${face.id} face draws a region of the other face` });
    }
  }
});

export type PbtaTheSprawlPlaybookPresentation = z.infer<typeof theSprawlPlaybookPresentationSchema>;
export type PbtaTheSprawlPlaybookRegionId = typeof regionIds[number];

/**
 * Consumer-neutral presentation semantics. `fields` name portable TOML paths;
 * they are bindings, not layout markup, CSS selectors, or runtime component IDs.
 */
export const PBTA_THE_SPRAWL_PLAYBOOK_PRESENTATION: PbtaTheSprawlPlaybookPresentation = theSprawlPlaybookPresentationSchema.parse({
  target: "the-sprawl-playbook",
  regions: [
    { id: "sprawl-header", label: "En-tête", group: "recto", primitive: "prose", fields: ["name", "characterName", "description"] },
    { id: "sprawl-look", label: "Apparence", group: "recto", primitive: "key-value", fields: ["look"] },
    { id: "sprawl-gear", label: "Équipement", group: "recto", primitive: "boxes", fields: ["gear", "missionGear", "cred"] },
    { id: "sprawl-cyberware", label: "Cybernétique", group: "recto", primitive: "boxes", fields: ["cyberware"] },
    { id: "sprawl-moves", label: "Manœuvres", group: "verso", primitive: "boxes", fields: ["moves", "startingMoves"] },
    { id: "sprawl-stats", label: "Stats", group: "verso", primitive: "hexagon", fields: ["stats"] },
    { id: "sprawl-cred-xp", label: "Cred et XP", group: "verso", primitive: "hexagon", fields: ["cred", "xp", "xpMax"] },
    { id: "sprawl-directives", label: "Directives", group: "verso", primitive: "boxes", fields: ["directives", "directiveChoices"] },
    { id: "sprawl-advancement", label: "Avancement", group: "verso", primitive: "boxes", fields: ["advancement"] },
    { id: "sprawl-links", label: "Liens", group: "verso", primitive: "hexagon", fields: ["links"] },
    { id: "sprawl-contacts", label: "Contacts", group: "verso", primitive: "list", fields: ["contacts"] },
    { id: "sprawl-harm", label: "Blessure", group: "verso", primitive: "hour-track", fields: ["hoursMarked"] },
  ],
  canonicalOrder: [
    "sprawl-header",
    "sprawl-look", "sprawl-gear", "sprawl-cyberware",
    "sprawl-moves", "sprawl-stats", "sprawl-cred-xp", "sprawl-directives",
    "sprawl-advancement", "sprawl-links", "sprawl-contacts", "sprawl-harm",
  ],
  faces: [
    {
      id: "recto",
      label: "Recto",
      header: "sprawl-header",
      columns: [
        ["sprawl-look", "sprawl-gear"],
        ["sprawl-cyberware"],
      ],
    },
    {
      id: "verso",
      label: "Verso",
      header: "sprawl-header",
      columns: [
        ["sprawl-moves", "sprawl-directives", "sprawl-advancement"],
        ["sprawl-stats", "sprawl-cred-xp", "sprawl-links", "sprawl-contacts", "sprawl-harm"],
      ],
    },
  ],
  fallbacks: { unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow" },
});

export function getPbtaTheSprawlPlaybookPresentation(target: string): PbtaTheSprawlPlaybookPresentation | undefined {
  return target === PBTA_THE_SPRAWL_PLAYBOOK_PRESENTATION.target ? PBTA_THE_SPRAWL_PLAYBOOK_PRESENTATION : undefined;
}
