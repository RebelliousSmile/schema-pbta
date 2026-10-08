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
import {
  PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION,
  urbanShadowsPlaybookPresentationSchema,
} from "../src/presentation/urban-shadows-playbook.js";
import { PBTA_URBAN_SHADOWS_APPEARANCE } from "../src/presentation/urban-shadows-appearance.js";
import { urbanShadowsPlaybookSchema } from "../src/zod/urban-shadows-playbook.js";
import { masksPlaybookPresentationSchema, PBTA_MASKS_PLAYBOOK_PRESENTATION } from "../src/presentation/masks-playbook.js";
import { masksNpcPresentationSchema, PBTA_MASKS_NPC_PRESENTATION } from "../src/presentation/masks-npc.js";
import { PBTA_MASKS_APPEARANCE } from "../src/presentation/masks-appearance.js";
import { masksPlaybookSchema } from "../src/zod/masks-playbook.js";
import { masksNpcSchema } from "../src/zod/masks-npc.js";

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
    assert.match(entry.path, /^(moves|advancement|advances|improvements|corruption\.advances|conditions|drives\.options)$/, `${key}: checked capability is not exported by this collection`);
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

assert.equal(PBTA_STAT_RANGE_PRESENTATIONS.length, 2, "Monsterhearts and Masks each publish one stat-range descriptor");
const statRange = getPbtaStatRangePresentation("monsterhearts-playbook");
assert.ok(statRange, "Monsterhearts publishes stat-range presentation metadata");
assert.deepEqual(statRange.order, ["min", "current", "max"], "stat range order is min/current/max");
assert.equal(statRange.statsPath, "stats");
assert.equal(statRange.rangesPath, "statRanges");
const masksStatRange = getPbtaStatRangePresentation("masks-playbook");
assert.ok(masksStatRange, "Masks publishes stat-range presentation metadata");
assert.equal(masksStatRange.rangesPath, "statRanges");
assert.deepEqual(masksStatRange.order, ["min", "current", "max"], "Masks stat range order is min/current/max");
assert.equal(getPbtaStatRangePresentation("urban-shadows-playbook"), undefined, "targets without display bounds publish no stat range");

const monsterheartsPresentation = PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION;
assert.equal(monsterheartsPresentation.regions.length, 13, "Monsterhearts publishes every complete-playbook region");
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
  [["base", true]],
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

const urbanShadowsPresentation = PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION;
assert.equal(urbanShadowsPresentation.regions.length, 19, "Urban Shadows publishes every region of both faces");
assert.deepEqual(
  urbanShadowsPresentation.canonicalOrder,
  urbanShadowsPresentation.regions.map((region) => region.id),
  "Urban Shadows canonical order follows the declared regions",
);
assert.deepEqual(urbanShadowsPresentation.fallbacks, {
  unplaced: "canonical-order", narrowPane: "canonical-flow", print: "canonical-flow",
});
assert.deepEqual(
  [...new Set(urbanShadowsPresentation.regions.map((region) => region.group))],
  ["recto", "verso"],
  "Urban Shadows regions list the front face, then the back",
);
const urbanShadowsPlaced = new Set((urbanShadowsPresentation.rows ?? []).flat(2));
assert.deepEqual(
  urbanShadowsPresentation.regions.filter((region) => !urbanShadowsPlaced.has(region.id)).map((region) => region.id),
  ["game-identity", "urban-shadows-creation"],
  "only the heading region and the creation choices, picked once and not drawn on the sheet, are left to the canonical fallback",
);

/** Walk a dotted TOML path through a document schema; a wrapper never hides a key. */
function declares(schema: unknown, fieldPath: string): boolean {
  let current = schema as { unwrap?: () => unknown; element?: unknown; shape?: Record<string, unknown> } | undefined;
  for (const key of fieldPath.split(".")) {
    for (;;) {
      if (current && typeof current.unwrap === "function") current = current.unwrap() as typeof current;
      else if (current?.element) current = current.element as typeof current;
      else break;
    }
    const next = current?.shape?.[key];
    if (!next) return false;
    current = next as typeof current;
  }
  return true;
}
assert.equal(declares(urbanShadowsPlaybookSchema, "editorial.opening"), true, "the field walk reads nested keys");
assert.equal(declares(urbanShadowsPlaybookSchema, "editorial.notAField"), false, "the field walk rejects an unknown key");
for (const region of urbanShadowsPresentation.regions) {
  for (const field of region.fields) {
    assert.ok(declares(urbanShadowsPlaybookSchema, field), `${region.id}: ${field} is not a field of the Urban Shadows playbook`);
  }
}
const urbanShadowsBound = new Set(urbanShadowsPresentation.regions.flatMap((region) => region.fields));
assert.equal(
  urbanShadowsBound.size,
  urbanShadowsPresentation.regions.reduce((count, region) => count + region.fields.length, 0) - 1,
  "only `stats` is bound by two regions (the spread and the Circles)",
);
assert.deepEqual(
  Object.keys(PBTA_URBAN_SHADOWS_APPEARANCE.resources.assets).sort(),
  [...urbanShadowsPresentation.pack.assets].sort(),
  "appearance assets must resolve every structural asset id",
);
assert.deepEqual(
  PBTA_URBAN_SHADOWS_APPEARANCE.variants.map((variant) => variant.id),
  urbanShadowsPresentation.pack.variants.map((variant) => variant.id),
  "appearance variants must match the structural contract",
);
for (const variant of PBTA_URBAN_SHADOWS_APPEARANCE.variants) {
  for (const token of urbanShadowsPresentation.pack.tokens) {
    assert.equal(typeof variant.tokens[token], "string", `${variant.id} must resolve ${token}`);
  }
}
const urbanShadowsUnplaced = urbanShadowsPlaybookPresentationSchema.parse({
  ...urbanShadowsPresentation,
  ...layoutFixture("valid/urban-shadows-layout-unplaced.json"),
});
assert.equal(urbanShadowsUnplaced.rows?.length, 1, "unplaced regions are valid and retain canonical fallback");
for (const invalid of [
  "invalid/urban-shadows-layout-unknown-region.json",
  "invalid/urban-shadows-layout-mixed-faces.json",
]) {
  assert.throws(
    () => urbanShadowsPlaybookPresentationSchema.parse({ ...urbanShadowsPresentation, ...layoutFixture(invalid) }),
    `presentation corpus rejects ${invalid}`,
  );
}

/* Masks: two layouts, one per target. A fixture names the paths it overrides and, for a reject, the defect it must name. */
type PresentationFixture = { target: string; set: Record<string, unknown>; rejects?: string };
function applyFixture<T extends object>(base: T, fixture: PresentationFixture): unknown {
  const copy = structuredClone(base) as Record<string, unknown>;
  for (const [fixturePath, value] of Object.entries(fixture.set)) {
    const segments = fixturePath.split(".");
    let cursor = copy as Record<string, unknown>;
    for (const segment of segments.slice(0, -1)) cursor = cursor[segment] as Record<string, unknown>;
    cursor[segments[segments.length - 1] as string] = value;
  }
  return copy;
}
const masksLayouts = {
  "masks-playbook": { base: PBTA_MASKS_PLAYBOOK_PRESENTATION, schema: masksPlaybookPresentationSchema },
  "masks-npc": { base: PBTA_MASKS_NPC_PRESENTATION, schema: masksNpcPresentationSchema },
} as const;
for (const kind of ["valid", "invalid"] as const) {
  const names = fs.readdirSync(new URL(`../corpus/presentation/${kind}`, import.meta.url)).filter((name) => name.startsWith("masks-") && name.includes("-layout-"));
  const targets = new Set<string>();
  for (const name of names) {
    const fixture = layoutFixture(`${kind}/${name}`) as unknown as PresentationFixture;
    const layout = masksLayouts[fixture.target as keyof typeof masksLayouts];
    assert.ok(layout, `${name}: unknown Masks target ${fixture.target}`);
    targets.add(fixture.target);
    const candidate = applyFixture(layout.base, fixture);
    if (kind === "valid") {
      assert.doesNotThrow(() => layout.schema.parse(candidate), `presentation corpus accepts ${name}`);
    } else {
      assert.ok(fixture.rejects, `${name}: a reject names the defect it carries`);
      const outcome = layout.schema.safeParse(candidate);
      assert.ok(!outcome.success, `presentation corpus rejects ${name}`);
      assert.ok(
        JSON.stringify(outcome.error.issues).includes(fixture.rejects),
        `${name}: expected the defect "${fixture.rejects}", got ${JSON.stringify(outcome.error.issues.map((issue) => issue.message))}`,
      );
    }
  }
  assert.deepEqual([...targets].sort(), ["masks-npc", "masks-playbook"], `the ${kind} presentation corpus covers both Masks targets`);
}

const masksPlaybookPresentation = PBTA_MASKS_PLAYBOOK_PRESENTATION;
assert.equal(masksPlaybookPresentation.regions.length, 13, "Masks publishes every region of the booklet");
assert.deepEqual(
  masksPlaybookPresentation.canonicalOrder,
  masksPlaybookPresentation.regions.map((region) => region.id),
  "Masks canonical order follows the declared regions",
);
assert.deepEqual(
  masksPlaybookPresentation.faces.map((face) => [face.id, face.header]),
  [["recto", "masks-header"], ["verso", "masks-header"]],
  "both faces share the header region",
);
const masksNpcPresentation = PBTA_MASKS_NPC_PRESENTATION;
assert.equal(masksNpcPresentation.regions.length, 8, "Masks publishes every region of the card");
assert.deepEqual(masksNpcPresentation.outsideCard, ["masks-npc-context"], "only the context is left outside the card");
assert.deepEqual(
  masksNpcPresentation.regions.filter((region) => region.group === "context").map((region) => region.id),
  masksNpcPresentation.outsideCard,
  "the regions named outside the card are the context ones",
);
assert.ok(
  masksNpcPresentation.rows.every((row) => row.length >= 1 && row.length <= 3) && masksNpcPresentation.rows.some((row) => row.length === 1) && masksNpcPresentation.rows.some((row) => row.length === 2),
  "the card has rows of one and of two columns",
);
for (const [presentation, schema, label] of [
  [masksPlaybookPresentation, masksPlaybookSchema, "Masks playbook"],
  [masksNpcPresentation, masksNpcSchema, "Masks NPC"],
] as const) {
  for (const region of presentation.regions) {
    for (const field of region.fields) {
      assert.ok(declares(schema, field), `${region.id}: ${field} is not a field of the ${label}`);
    }
  }
  assert.ok(presentation.regions.every((region) => /[A-Za-zÀ-ÿ]/.test(region.label)), `${label}: every region carries a label`);
}
assert.deepEqual(PBTA_MASKS_APPEARANCE.targets, ["masks-playbook", "masks-npc"], "the Masks appearance serves both targets");

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

console.log(`✓ validated ${PBTA_COLLECTION_PRESENTATIONS.length} PbtA collection presentations, Monsterhearts, Urban Shadows and Masks layout semantics`);
