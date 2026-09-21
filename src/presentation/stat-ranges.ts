import type { PbtaDocumentTarget } from "../codecs/toml.js";

export type PbtaStatRangeValue = "min" | "current" | "max";
export interface PbtaStatRangePresentation {
  target: Extract<PbtaDocumentTarget, "monsterhearts-playbook">;
  statsPath: "stats";
  rangesPath: "statRanges";
  minField: "min";
  maxField: "max";
  order: readonly PbtaStatRangeValue[];
}

export const PBTA_STAT_RANGE_PRESENTATIONS: readonly PbtaStatRangePresentation[] = [{
  target: "monsterhearts-playbook", statsPath: "stats", rangesPath: "statRanges", minField: "min", maxField: "max", order: ["min", "current", "max"],
}];

export function getPbtaStatRangePresentation(target: PbtaDocumentTarget): PbtaStatRangePresentation | undefined {
  return PBTA_STAT_RANGE_PRESENTATIONS.find((entry) => entry.target === target);
}
