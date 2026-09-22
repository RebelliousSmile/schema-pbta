/** Shared visual intentions for Markdown callouts in PbtA notes. */
export const PBTA_VISUAL_CALLOUTS = [
  { id: "pbta-clock", label: "PbtA clock", template: "title-body", capability: "style:pbta" },
  { id: "pbta-move", label: "PbtA move", template: "title-body", capability: "style:pbta" },
  { id: "pbta-npc-reaction", label: "PbtA NPC reaction", template: "title-body", capability: "style:pbta" },
  { id: "pbta-playbook-change", label: "PbtA playbook change", template: "title-body", capability: "style:pbta" },
] as const;

export type PbtaVisualCallout = typeof PBTA_VISUAL_CALLOUTS[number];
