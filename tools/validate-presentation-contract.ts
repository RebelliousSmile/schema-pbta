import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PBTA_COLLECTION_PRESENTATIONS,
  type PbtaCollectionPresentation,
  validatePbtaCollectionItemEditor,
} from "../src/presentation/collections.js";
import { PBTA_STAT_RANGE_PRESENTATIONS, getPbtaStatRangePresentation } from "../src/presentation/stat-ranges.js";
import {
  monsterheartsPlaybookPresentationSchema,
  PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION,
} from "../src/presentation/monsterhearts-playbook.js";
import { PBTA_MONSTERHEARTS_APPEARANCE } from "../src/presentation/monsterhearts-appearance.js";

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

const monsterheartsPresentation = PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION;
assert.equal(monsterheartsPresentation.regions.length, 12, "Monsterhearts publishes every complete-playbook region");
assert.deepEqual(monsterheartsPresentation.rows?.[0]?.[1], ["playbook-portrait"], "portrait alone occupies the first row's middle column");
assert.deepEqual(
  monsterheartsPresentation.canonicalOrder,
  monsterheartsPresentation.regions.map((region) => region.id),
  "Monsterhearts canonical order follows the declared regions",
);
assert.deepEqual(monsterheartsPresentation.fallbacks, {
  unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow",
});
assert.deepEqual(
  monsterheartsPresentation.pack.variants.map((variant) => [variant.id, variant.presentationOnly]),
  [["base", true], ["drowned-lake", true]],
  "Monsterhearts variants remain presentation-only pack metadata",
);
assert.equal(monsterheartsPresentation.pack.appearanceArtifact, "appearance-contract.json");
assert.deepEqual(
  Object.keys(PBTA_MONSTERHEARTS_APPEARANCE.resources.assets).sort(),
  [...monsterheartsPresentation.pack.assets].sort(),
  "appearance assets must resolve every structural asset id",
);
assert.deepEqual(
  PBTA_MONSTERHEARTS_APPEARANCE.variants.map((variant) => variant.id),
  monsterheartsPresentation.pack.variants.map((variant) => variant.id),
  "appearance variants must match the structural contract",
);
for (const variant of PBTA_MONSTERHEARTS_APPEARANCE.variants) {
  for (const token of monsterheartsPresentation.pack.tokens) {
    assert.equal(typeof variant.tokens[token], "string", `${variant.id} must resolve ${token}`);
  }
}

function layoutFixture(name: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(
    new URL(`../corpus/presentation/${name}`, import.meta.url),
    "utf8",
  )) as Record<string, unknown>;
}

const unplaced = monsterheartsPlaybookPresentationSchema.parse({
  ...monsterheartsPresentation,
  ...layoutFixture("valid/monsterhearts-layout-unplaced.json"),
});
assert.deepEqual(unplaced.columns, [["game-identity"]], "unplaced regions are valid and retain canonical fallback");
for (const invalid of [
  "invalid/monsterhearts-layout-unknown-region.json",
  "invalid/monsterhearts-layout-duplicate-region.json",
  "invalid/monsterhearts-layout-empty-column.json",
]) {
  assert.throws(
    () => monsterheartsPlaybookPresentationSchema.parse({ ...monsterheartsPresentation, ...layoutFixture(invalid) }),
    `presentation corpus rejects ${invalid}`,
  );
}

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

console.log(`✓ validated ${PBTA_COLLECTION_PRESENTATIONS.length} PbtA collection presentations and Monsterhearts layout semantics`);
