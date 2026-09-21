import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PBTA_COLLECTION_PRESENTATIONS,
  type PbtaCollectionPresentation,
  validatePbtaCollectionItemEditor,
} from "../src/presentation/collections.js";
import { PBTA_STAT_RANGE_PRESENTATIONS, getPbtaStatRangePresentation } from "../src/presentation/stat-ranges.js";

const keys = new Set<string>();

for (const entry of PBTA_COLLECTION_PRESENTATIONS) {
  const key = `${entry.target}:${entry.path}`;
  assert.ok(!keys.has(key), `duplicate collection presentation ${key}`);
  keys.add(key);
  assert.match(entry.path, /^[a-z][A-Za-z0-9]*(?:\[\])?(?:\.[a-z][A-Za-z0-9]*(?:\[\])?)*$/, `${key}: invalid field path`);
  assert.doesNotThrow(() => validatePbtaCollectionItemEditor(entry.itemEditor), `${key}: unknown item editor ${entry.itemEditor}`);
  assert.equal(entry.cardinality, "mutable", `${key}: PbtA collections default to mutable`);
  assert.equal(entry.reorder, true, `${key}: PbtA collections must be reorderable`);
  if (entry.itemCapabilities?.includes("checked")) {
    assert.match(entry.path, /^(moves|advancement|advances|improvements|corruption\.advances)$/, `${key}: checked capability is not exported by this collection`);
  }
}

const targetCounts = new Map<PbtaCollectionPresentation["target"], number>();
for (const entry of PBTA_COLLECTION_PRESENTATIONS) {
  targetCounts.set(entry.target, (targetCounts.get(entry.target) ?? 0) + 1);
}
for (const [target, count] of targetCounts) assert.ok(count > 0, `${target}: no collection presentation`);

const monsterheartsPaths = PBTA_COLLECTION_PRESENTATIONS
  .filter((entry) => entry.target === "monsterhearts-playbook")
  .map((entry) => entry.path);
assert.ok(!monsterheartsPaths.includes("editorial.playAdvice.paragraphs"), "Monsterhearts must not publish play advice editing");
assert.ok(!monsterheartsPaths.includes("editorial.mcGuidance.paragraphs"), "Monsterhearts must not publish MC guidance editing");
assert.ok(
  PBTA_COLLECTION_PRESENTATIONS.some((entry) => entry.target === "masks-playbook" && entry.path === "editorial.playAdvice.paragraphs"),
  "other playbook targets retain play advice editing",
);

assert.equal(PBTA_STAT_RANGE_PRESENTATIONS.length, 1, "exactly one stat-range descriptor is published");
const statRange = getPbtaStatRangePresentation("monsterhearts-playbook");
assert.ok(statRange, "Monsterhearts publishes stat-range presentation metadata");
assert.deepEqual(statRange.order, ["min", "current", "max"], "stat range order is min/current/max");
assert.equal(statRange.statsPath, "stats");
assert.equal(statRange.rangesPath, "statRanges");
assert.equal(getPbtaStatRangePresentation("masks-playbook"), undefined, "other targets do not publish Monsterhearts ranges");

const unknownItemEditorFixture = JSON.parse(
  fs.readFileSync(
    new URL("../corpus/presentation/invalid/unknown-item-editor.json", import.meta.url),
    "utf8",
  ),
) as { itemEditor?: unknown };
assert.throws(
  () => validatePbtaCollectionItemEditor(unknownItemEditorFixture.itemEditor),
  /unknown PbtA collection item editor: "pbta-unknown"/,
  "presentation corpus rejects an unknown collection item editor",
);

console.log(`✓ validated ${PBTA_COLLECTION_PRESENTATIONS.length} PbtA collection presentations`);
