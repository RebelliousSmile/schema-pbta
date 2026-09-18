import type { PbtaDocumentTarget } from "../codecs/toml.js";

export type PbtaCollectionCardinality = "fixed" | "mutable";
export type PbtaCollectionItemCapability = "checked";
export type PbtaCollectionCreationVariant = "inline" | "object" | "text";
export const PBTA_COLLECTION_ITEM_EDITORS = [
  "pbta-ascendant", "pbta-advancement", "pbta-choice-move", "pbta-choice-set",
  "pbta-condition", "pbta-creation-option", "pbta-creation-question", "pbta-gear",
  "pbta-move", "pbta-relationship", "pbta-scar", "pbta-stat-profile", "pbta-text",
] as const;
export type PbtaCollectionItemEditor = typeof PBTA_COLLECTION_ITEM_EDITORS[number];

export interface PbtaCollectionPresentation {
  target: Extract<PbtaDocumentTarget, `${string}-playbook`>;
  path: string;
  label: string;
  itemEditor: PbtaCollectionItemEditor;
  creationVariant: PbtaCollectionCreationVariant;
  cardinality: PbtaCollectionCardinality;
  reorder: true;
  itemCapabilities?: readonly PbtaCollectionItemCapability[];
}

type CollectionEntry = readonly [string, string, PbtaCollectionItemEditor, PbtaCollectionCreationVariant];

const common = [
  ["statProfiles", "Stat profiles", "pbta-stat-profile", "object"],
  ["moves", "Moves", "pbta-move", "inline"],
  ["startingMoves", "Starting moves", "pbta-text", "text"],
  ["choiceSets", "Choice sets", "pbta-choice-set", "object"],
  ["choiceSets[].choices", "Choices", "pbta-choice-move", "inline"],
  ["advancement", "Advancement", "pbta-advancement", "object"],
  ["creation", "Creation", "pbta-creation-question", "object"],
  ["creation[].options", "Options", "pbta-creation-option", "text"],
  ["gear", "Gear", "pbta-gear", "object"],
  ["editorial.opening.paragraphs", "Opening paragraphs", "pbta-text", "text"],
  ["editorial.playAdvice.paragraphs", "Play advice paragraphs", "pbta-text", "text"],
  ["editorial.identity.paragraphs", "Identity paragraphs", "pbta-text", "text"],
  ["editorial.progression.paragraphs", "Progression paragraphs", "pbta-text", "text"],
] as const satisfies readonly CollectionEntry[];
const targets = [
  "masks-playbook",
  "monster-of-the-week-playbook",
  "monsterhearts-playbook",
  "the-sprawl-playbook",
  "urban-shadows-playbook",
] as const satisfies readonly Extract<PbtaDocumentTarget, `${string}-playbook`>[];

function collection(
  target: PbtaCollectionPresentation["target"],
  [path, label, itemEditor, creationVariant]: CollectionEntry,
  itemCapabilities?: readonly PbtaCollectionItemCapability[],
): PbtaCollectionPresentation {
  return { target, path, label, itemEditor, creationVariant, cardinality: "mutable", reorder: true, ...(itemCapabilities ? { itemCapabilities } : {}) };
}

export const PBTA_COLLECTION_PRESENTATIONS: readonly PbtaCollectionPresentation[] = [
  ...targets.flatMap((target) => common.map((entry) => collection(target, entry, entry[0] === "moves" || entry[0] === "advancement" ? ["checked"] : undefined))),
  collection("masks-playbook", ["influence", "Influence", "pbta-text", "text"]),
  collection("monster-of-the-week-playbook", ["improvements", "Improvements", "pbta-advancement", "object"], ["checked"]),
  collection("monsterhearts-playbook", ["ascendants", "Ascendants", "pbta-ascendant", "object"]),
  collection("monsterhearts-playbook", ["conditions", "Conditions", "pbta-condition", "object"]),
  collection("monsterhearts-playbook", ["backstory", "Backstory", "pbta-text", "text"]),
  collection("monsterhearts-playbook", ["advances", "Advances", "pbta-advancement", "object"], ["checked"]),
  collection("monsterhearts-playbook", ["editorial.darkestSelf.paragraphs", "Darkest Self paragraphs", "pbta-text", "text"]),
  collection("monsterhearts-playbook", ["editorial.sexMove.paragraphs", "Sex Move paragraphs", "pbta-text", "text"]),
  collection("monsterhearts-playbook", ["editorial.mcGuidance.paragraphs", "MC guidance paragraphs", "pbta-text", "text"]),
  collection("the-sprawl-playbook", ["directives", "Directives", "pbta-text", "text"]),
  collection("the-sprawl-playbook", ["missionGear", "Mission gear", "pbta-text", "text"]),
  collection("urban-shadows-playbook", ["mortalRelationships", "Mortal relationships", "pbta-relationship", "object"]),
  collection("urban-shadows-playbook", ["scars", "Scars", "pbta-scar", "object"]),
  collection("urban-shadows-playbook", ["corruption.advances", "Corruption advances", "pbta-advancement", "object"], ["checked"]),
  collection("urban-shadows-playbook", ["corruption.moves", "Corruption moves", "pbta-text", "text"]),
];

export function getPbtaCollectionPresentation(
  target: PbtaCollectionPresentation["target"],
  path: string,
): PbtaCollectionPresentation | undefined {
  return PBTA_COLLECTION_PRESENTATIONS.find((entry) => entry.target === target && entry.path === path);
}
