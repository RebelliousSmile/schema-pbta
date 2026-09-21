import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PBTA_DOCUMENT_CODECS, type PbtaDocumentTarget } from "../src/codecs/toml.js";
import { packManifestSchema } from "../src/pack-manifest.js";
import {
  monsterheartsPlaybookPresentationSchema,
  PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION,
} from "../src/presentation/monsterhearts-playbook.js";

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

if (manifest.pack.id === "monsterhearts") {
  assert.deepEqual(manifest.presentation, {
    target: "monsterhearts-playbook",
    artifact: "presentation-contract.json",
  }, "Monsterhearts must advertise its generated presentation contract");
  const artifact = monsterheartsPlaybookPresentationSchema.parse(JSON.parse(fs.readFileSync(
    path.join(path.dirname(file), manifest.presentation.artifact),
    "utf8",
  )));
  assert.deepEqual(
    artifact,
    PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION,
    "Monsterhearts pack artifact must be generated from the npm presentation export",
  );
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
