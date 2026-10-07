/** Shared visual intentions for Markdown callouts in PbtA notes. */
export const PBTA_VISUAL_CALLOUTS = [
  { id: "pbta-clock", label: "PbtA clock", template: "title-body", capability: "style:pbta" },
  { id: "pbta-move", label: "PbtA move", template: "title-body", capability: "style:pbta" },
  { id: "pbta-npc-reaction", label: "PbtA NPC reaction", template: "title-body", capability: "style:pbta" },
  { id: "pbta-playbook-change", label: "PbtA playbook change", template: "title-body", capability: "style:pbta" },
] as const;

/**
 * Callouts published by a single pack. They are styled only under the pack's own
 * game scope and complete, never replace, the shared set above.
 */
export const PBTA_PACK_CALLOUTS = [
  { pack: "monsterhearts", id: "monsterhearts-note", label: "Note Monsterhearts (clair, hachurée)", template: "title-body", capability: "style:pbta" },
  { pack: "monsterhearts", id: "monsterhearts-note-dark", label: "Note Monsterhearts (fond foncé)", template: "title-body", capability: "style:pbta" },
  { pack: "urban-shadows", id: "urban-shadows-move", label: "Mouvement Urban Shadows (panneau gris à filets)", template: "title-body", capability: "style:pbta" },
  { pack: "urban-shadows", id: "urban-shadows-choice", label: "Choix à cases Urban Shadows (panneau lavande)", template: "title-body", capability: "style:pbta" },
  { pack: "urban-shadows", id: "urban-shadows-aside", label: "Aparté Urban Shadows (filets latéraux)", template: "title-body", capability: "style:pbta" },
  { pack: "urban-shadows", id: "urban-shadows-solid", label: "Encadré plein Urban Shadows (fond de nuit)", template: "title-body", capability: "style:pbta" },
  { pack: "urban-shadows", id: "urban-shadows-archetype", label: "Panneau d’archétype Urban Shadows", template: "title-body", capability: "style:pbta" },
  { pack: "urban-shadows", id: "urban-shadows-example", label: "Exemple de jeu Urban Shadows", template: "title-body", capability: "style:pbta" },
] as const;

export type PbtaPackCallout = typeof PBTA_PACK_CALLOUTS[number];
export type PbtaVisualCallout = typeof PBTA_VISUAL_CALLOUTS[number];
