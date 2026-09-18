import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PBTA_COLLECTION_PRESENTATIONS,
  type PbtaCollectionPresentation,
  validatePbtaCollectionItemEditor,
} from "../src/presentation/collections.js";

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
