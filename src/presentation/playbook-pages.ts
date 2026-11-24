import { z } from "zod";
import { localizedLabelSchema } from "./label.js";

/**
 * The printed pages of a playbook sheet. A sheet that declares pages is exported page by page: one
 * image per page, one printed sheet per page. A page either prints the regions of the faces it
 * names (`groups`, the `group` of the regions of the target's presentation), or the whole sheet
 * when it names none (a sheet without a presentation), or it is the notes page (`notes_field`, the
 * field the player writes into), never both. A booklet either ends with one notes page, or has none:
 * Urban Shadows and Monsterhearts print their notes in a region of the back of the sheet, so they
 * declare no notes page at all.
 *
 * The pages are declared apart from the region layout of each target: a page is a unit of
 * export, a region a unit of layout, and the notes page owns no region.
 */
const label = localizedLabelSchema;

export const playbookPageSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label,
  groups: z.array(z.string().min(1)).min(1).optional(),
  notes_field: z.string().min(1).optional(),
});

export const playbookPagesSchema = z.array(playbookPageSchema).min(2).superRefine((pages, context) => {
  if (new Set(pages.map((page) => page.id)).size !== pages.length) {
    context.addIssue({ code: "custom", message: "pages contain a duplicate id" });
  }
  const notes = pages.filter((page) => page.notes_field !== undefined);
  if (notes.length > 1 || (notes.length === 1 && pages[pages.length - 1] !== notes[0])) {
    context.addIssue({ code: "custom", message: "pages carry at most one notes page, and it is the last one" });
  }
  if (notes[0]?.groups !== undefined) {
    context.addIssue({ code: "custom", message: "the notes page prints no region" });
  }
});

export type PbtaPlaybookPage = z.infer<typeof playbookPageSchema>;

/** The target keys carry a playbook sheet; `playbook` is the generic one, without a region layout. */
export type PbtaPlaybookPagesTarget =
  | "masks-playbook"
  | "the-sprawl-playbook"
  | "urban-shadows-playbook"
  | "monsterhearts-playbook"
  | "playbook";

const NOTES_PAGE = {
  id: "notes",
  label: { fr: "Notes de partie", en: "Session notes" },
  notes_field: "sessionNotes",
} as const;

const FACE_PAGES = [
  { id: "recto", label: { fr: "Recto", en: "Front" }, groups: ["recto"] },
  { id: "verso", label: { fr: "Verso", en: "Back" }, groups: ["verso"] },
  NOTES_PAGE,
] as const;

/** The pages of each playbook target, in print order. */
export const PBTA_PLAYBOOK_PAGES: Readonly<Record<PbtaPlaybookPagesTarget, readonly PbtaPlaybookPage[]>> = {
  "masks-playbook": playbookPagesSchema.parse(FACE_PAGES),
  "the-sprawl-playbook": playbookPagesSchema.parse(FACE_PAGES),
  /* The notes are a region of the back of the sheet: no page of their own. */
  "urban-shadows-playbook": playbookPagesSchema.parse(FACE_PAGES.slice(0, 2)),
  "monsterhearts-playbook": playbookPagesSchema.parse([
    {
      id: "recto",
      label: { fr: "Recto", en: "Front" },
      groups: ["identity", "playbook", "relationships", "state", "editorial"],
    },
    { id: "verso", label: { fr: "Verso", en: "Back" }, groups: ["notes"] },
  ]),
  playbook: playbookPagesSchema.parse([
    { id: "sheet", label: { fr: "Fiche", en: "Sheet" } },
    NOTES_PAGE,
  ]),
};

export function getPbtaPlaybookPages(target: string): readonly PbtaPlaybookPage[] | undefined {
  return Object.prototype.hasOwnProperty.call(PBTA_PLAYBOOK_PAGES, target)
    ? PBTA_PLAYBOOK_PAGES[target as PbtaPlaybookPagesTarget]
    : undefined;
}
