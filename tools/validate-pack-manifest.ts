import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PBTA_DOCUMENT_CODECS, type PbtaDocumentTarget } from "../src/codecs/toml.js";
import { packManifestSchema } from "../src/pack-manifest.js";
import { PBTA_MONSTERHEARTS_APPEARANCE } from "../src/presentation/monsterhearts-appearance.js";
import { PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION } from "../src/presentation/monsterhearts-playbook.js";
import { PBTA_MASKS_APPEARANCE } from "../src/presentation/masks-appearance.js";
import { PBTA_MASKS_NPC_PRESENTATION } from "../src/presentation/masks-npc.js";
import { PBTA_MASKS_PLAYBOOK_PRESENTATION } from "../src/presentation/masks-playbook.js";
import { PBTA_URBAN_SHADOWS_APPEARANCE } from "../src/presentation/urban-shadows-appearance.js";
import { PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION } from "../src/presentation/urban-shadows-playbook.js";

type ContractCase = { path: string; target: PbtaDocumentTarget; expect: "accept" | "reject" };

/* npm eats its own "--" separator, pnpm forwards it; neither is a manifest path. */
const source = process.argv.slice(2).find((value) => !value.startsWith("--"));
assert.ok(source, "usage: npm run validate:pack -- packs/<pack>/pack-contract.json");
const file = path.resolve(process.cwd(), source);
const root = path.resolve(process.cwd(), "corpus", "contract");
const manifest = packManifestSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
const provider = JSON.parse(fs.readFileSync(path.join(process.cwd(), "cross-tool-provider.json"), "utf8")) as {
  provider?: unknown;
  capabilities?: { lantern?: unknown; handbook?: unknown };
};
assert.equal(provider.provider, manifest.provider, "manifest provider differs from this schema source");
for (const host of ["lantern", "handbook"] as const) {
  const published = provider.capabilities?.[host];
  assert.ok(Array.isArray(published) && published.every((value) => typeof value === "string"), `provider has no ${host} capability list`);
  for (const capability of manifest.requirements[host]) assert.ok(published.includes(capability), `unpublished ${host} capability: ${capability}`);
}

/* A pack that publishes a layout advertises it; the artifacts it names are the generated ones, never a hand copy. */
const published = [
  {
    pack: PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.pack.id, presentation: PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION,
    appearance: PBTA_MONSTERHEARTS_APPEARANCE, artifact: "presentation-contract.json",
    appearanceArtifact: PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.pack.appearanceArtifact,
  },
  {
    pack: PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION.pack.id, presentation: PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION,
    appearance: PBTA_URBAN_SHADOWS_APPEARANCE, artifact: "presentation-contract.json",
    appearanceArtifact: PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION.pack.appearanceArtifact,
  },
  /* Masks publishes two layouts, one per target, and one appearance both resolve against. */
  {
    pack: "masks", presentation: PBTA_MASKS_PLAYBOOK_PRESENTATION, appearance: PBTA_MASKS_APPEARANCE,
    artifact: "presentation-contract.json", appearanceArtifact: "appearance-contract.json",
  },
  {
    pack: "masks", presentation: PBTA_MASKS_NPC_PRESENTATION, appearance: PBTA_MASKS_APPEARANCE,
    artifact: "npc-presentation-contract.json", appearanceArtifact: "appearance-contract.json",
  },
].filter((entry) => entry.pack === manifest.pack.id);
assert.deepEqual(
  manifest.presentation,
  published.length === 0 ? undefined : published.map((entry) => ({
    target: entry.presentation.target,
    artifact: entry.artifact,
    appearanceArtifact: entry.appearanceArtifact,
  })),
  `${manifest.pack.id} must advertise exactly its generated presentation contracts`,
);
for (const entry of manifest.presentation ?? []) {
  const source = published.find((candidate) => candidate.presentation.target === entry.target);
  assert.ok(source, `${manifest.pack.id}: no presentation export for ${entry.target}`);
  assert.ok(
    manifest.documents.some((document) => document.target === entry.target),
    `${manifest.pack.id}: presentation of an undocumented target ${entry.target}`,
  );
  for (const [name, expected] of [
    [entry.artifact, source.presentation],
    [entry.appearanceArtifact, source.appearance],
  ] as const) {
    assert.deepEqual(
      JSON.parse(fs.readFileSync(path.join(path.dirname(file), name), "utf8")),
      expected,
      `${manifest.pack.id}: ${name} must be generated from the npm presentation export`,
    );
  }
}
if ((manifest.presentation ?? []).some((entry) => entry.target.startsWith("masks-"))) {
  /* A pack that lays out a sheet asks Handbook for the layout; Lantern does not render it. */
  assert.ok(manifest.requirements.handbook.includes("presentation:pbta-layout"), "masks: handbook must require presentation:pbta-layout");
  assert.ok(!manifest.requirements.lantern.includes("presentation:pbta-layout"), "masks: lantern must not require presentation:pbta-layout");
}

/* The corpus is the only source of canonical witnesses: a fixture outside it proves nothing about the contract. */
const contract = JSON.parse(fs.readFileSync(path.join(root, "cases.json"), "utf8")) as { cases: ContractCase[] };
const accepted = new Map<PbtaDocumentTarget, Set<string>>();
for (const entry of contract.cases) {
  if (entry.expect !== "accept") continue;
  const witnesses = accepted.get(entry.target) ?? new Set<string>();
  witnesses.add(entry.path.split("\\").join("/"));
  accepted.set(entry.target, witnesses);
}

/* A document the pack names twice would let one target hide behind another’s proof. */
const documented = new Set<PbtaDocumentTarget>();
for (const document of manifest.documents) {
  assert.ok(!documented.has(document.target), `target documented twice: ${document.target}`);
  documented.add(document.target);

  const fixture = path.resolve(root, document.fixture);
  assert.ok(fixture.startsWith(`${root}${path.sep}`), `fixture escapes corpus: ${document.fixture}`);
  assert.ok(fs.statSync(fixture).isFile(), `missing fixture: ${document.fixture}`);
  assert.ok(
    accepted.get(document.target)?.has(document.fixture),
    `${document.fixture} is not an accepted ${document.target} witness in the contract corpus`,
  );

  /* Parsing under the declared target is what ties the fixture to the codec the hosts will use. */
  const codec = PBTA_DOCUMENT_CODECS[document.target];
  const canonical = codec.parseToml(fs.readFileSync(fixture, "utf8")) as Record<string, unknown>;

  /* The named mutation is the editable field the hosts promise to carry; prove it exists and survives a TOML round trip. */
  assert.ok(
    Object.prototype.hasOwnProperty.call(canonical, document.mutation),
    `${document.target}: mutation ${document.mutation} names no field of ${document.fixture}`,
  );
  const before = canonical[document.mutation];
  assert.equal(typeof before, "string", `${document.target}: mutation ${document.mutation} is not a text field`);
  const after = `${before as string} (mutated)`;
  const mutated = codec.parseToml(codec.stringifyToml({ ...canonical, [document.mutation]: after })) as Record<string, unknown>;
  assert.equal(mutated[document.mutation], after, `${document.target}: mutation ${document.mutation} did not survive the round trip`);
  assert.deepEqual(
    { ...mutated, [document.mutation]: before },
    canonical,
    `${document.target}: mutating ${document.mutation} changed another field`,
  );
}

/* Every codec target named after this pack belongs to this pack: a new specialised codec cannot ship undocumented. */
const owned = (Object.keys(PBTA_DOCUMENT_CODECS) as PbtaDocumentTarget[]).filter((target) => target.startsWith(`${manifest.pack.id}-`));
for (const target of owned) {
  assert.ok(documented.has(target), `${manifest.pack.id} does not document its own target: ${target}`);
}

console.log(`✓ ${manifest.pack.id}: ${manifest.documents.length} documented target${manifest.documents.length === 1 ? "" : "s"} (${[...documented].join(", ")})`);
