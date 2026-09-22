import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PBTA_MONSTERHEARTS_APPEARANCE, monsterheartsAppearanceSchema } from "../src/presentation/monsterhearts-appearance.js";
import { PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS } from "../src/presentation/monsterhearts-appearance-assets.js";
import { PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION } from "../src/presentation/monsterhearts-playbook.js";

const packRoot = path.join(process.cwd(), "packs", "monsterhearts");
const artifact = monsterheartsAppearanceSchema.parse(JSON.parse(fs.readFileSync(
  path.join(packRoot, PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.pack.appearanceArtifact), "utf8",
)));
assert.deepEqual(artifact, PBTA_MONSTERHEARTS_APPEARANCE, "appearance artifact must be generated from the ESM source");
assert.deepEqual(
  artifact.variants.map((variant) => variant.id),
  PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.pack.variants.map((variant) => variant.id),
  "appearance variants must match the structural descriptor",
);
assert.deepEqual(
  Object.keys(artifact.resources.assets).sort(),
  [...PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.pack.assets].sort(),
  "appearance assets must match the structural descriptor",
);
assert.deepEqual(
  Object.keys(PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS.fonts).sort(),
  Object.keys(artifact.resources.fonts).sort(),
  "browser URL fonts must match the appearance descriptor",
);
assert.deepEqual(
  Object.keys(PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS.assets).sort(),
  Object.keys(artifact.resources.assets).sort(),
  "browser URL assets must match the appearance descriptor",
);
assert.deepEqual(
  Object.keys(PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS.variants),
  artifact.variants.map((variant) => variant.id),
  "browser URL variants must match the appearance descriptor",
);
for (const resource of [
  ...Object.values(PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS.fonts),
  ...Object.values(PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS.assets),
  ...Object.values(PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS.variants["drowned-lake"].assetOverrides),
]) {
  assert.equal(new URL(resource).protocol, "file:", `invalid browser resource URL: ${resource}`);
}
for (const variant of artifact.variants) {
  for (const token of PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.pack.tokens) {
    assert.equal(typeof variant.tokens[token], "string", `${variant.id} does not resolve ${token}`);
  }
}

const resourcePaths = [
  ...Object.values(artifact.resources.fonts),
  ...artifact.resources.stylesheets,
  ...Object.values(artifact.resources.assets),
];
for (const resource of resourcePaths) {
  const absolute = path.resolve(packRoot, resource);
  assert.ok(absolute.startsWith(`${packRoot}${path.sep}`), `resource escapes pack: ${resource}`);
  assert.ok(fs.statSync(absolute).isFile(), `missing appearance resource: ${resource}`);
}

type Fixture = { variant: string; tokens: Record<string, string>; assets: Record<string, string> };
for (const name of ["monsterhearts-appearance-base.json", "monsterhearts-appearance-drowned-lake.json"]) {
  const fixture = JSON.parse(fs.readFileSync(path.join(process.cwd(), "corpus", "presentation", "valid", name), "utf8")) as Fixture;
  const variant = artifact.variants.find((entry) => entry.id === fixture.variant);
  assert.ok(variant, `${name}: unknown variant`);
  assert.deepEqual(variant.tokens, fixture.tokens, `${name}: token resolution differs`);
  assert.deepEqual({ ...artifact.resources.assets, ...variant.assetOverrides }, fixture.assets, `${name}: asset resolution differs`);
}

console.log("✓ validated Monsterhearts appearance artifact, resources, and consumer fixtures");
