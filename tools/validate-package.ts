import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "schema-pbta-package-"));
const suppliedTarball = process.argv.slice(2).find((argument) => argument.endsWith(".tgz"));
const npmCli = process.env.npm_execpath ?? path.join(
  path.dirname(process.execPath),
  "node_modules",
  "npm",
  "bin",
  "npm-cli.js",
);
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  name: string;
  version: string;
};

function run(command: string, args: string[], cwd = root): string {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: process.env,
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}`,
    );
  }
  return result.stdout;
}

try {
  const tarball = suppliedTarball
    ? path.resolve(root, suppliedTarball)
    : (() => {
      const packOutput = run(process.execPath, [npmCli,
        "pack",
        "--json",
        "--silent",
        "--pack-destination",
        temporaryRoot,
      ]);
      const jsonStart = packOutput.lastIndexOf("\n[");
      const packed = JSON.parse(
        jsonStart === -1 ? packOutput : packOutput.slice(jsonStart + 1),
      ) as Array<{ filename: string }>;
      assert.equal(packed.length, 1, "npm pack must produce exactly one tarball");
      return path.join(temporaryRoot, packed[0].filename);
    })();
  assert.ok(fs.statSync(tarball).isFile(), `missing tarball: ${tarball}`);

  const consumerRoot = path.join(temporaryRoot, "consumer");
  fs.mkdirSync(consumerRoot);
  fs.writeFileSync(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run(
    process.execPath,
    [npmCli, "install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
    consumerRoot,
  );

  const checkSource = `
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PBTA_CONTRACT_SCHEMA_TAG,
  PBTA_CONTRACT_VERSION,
  PBTA_DOCUMENT_CODECS,
  PBTA_TOML_VERSION,
  packManifestSchema,
  crossToolProviderSchema,
  parseFrontToml,
  parseGameDefinitionToml,
  parseMoveToml,
  parseMasksPlaybookToml,
  parseMonsterOfTheWeekPlaybookToml,
  parseMonsterheartsPlaybookToml,
  parseNpcToml,
  parsePlaybookToml,
  parseTheSprawlPlaybookToml,
  parseUrbanShadowsPlaybookToml,
  parseSalvageRunPlaybookToml,
  PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION,
  PBTA_MONSTERHEARTS_APPEARANCE,
  getPbtaMonsterheartsPlaybookPresentation,
} from "schema-pbta";

assert.equal(PBTA_CONTRACT_VERSION, 8);
assert.equal(PBTA_CONTRACT_SCHEMA_TAG, "v8.0.0");
assert.equal(PBTA_TOML_VERSION, "1.0.0");
assert.deepEqual(
  getPbtaMonsterheartsPlaybookPresentation("monsterhearts-playbook"),
  PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION,
);
assert.deepEqual(Object.keys(PBTA_DOCUMENT_CODECS).sort(), [
  "front", "game-definition", "masks-playbook", "monster-of-the-week-playbook", "monsterhearts-playbook", "move", "npc", "playbook", "salvage-run-playbook", "the-sprawl-playbook", "urban-shadows-playbook",
]);
for (const parser of [
  parseFrontToml,
  parseGameDefinitionToml,
  parseMoveToml,
  parseMasksPlaybookToml,
  parseMonsterOfTheWeekPlaybookToml,
  parseMonsterheartsPlaybookToml,
  parseNpcToml,
  parsePlaybookToml,
  parseTheSprawlPlaybookToml,
  parseUrbanShadowsPlaybookToml,
  parseSalvageRunPlaybookToml,
]) assert.equal(typeof parser, "function");

const schemaUrl = import.meta.resolve("schema-pbta/schemas/v8/monsterhearts/monsterhearts-playbook.schema.json");
const schema = JSON.parse(fs.readFileSync(new URL(schemaUrl), "utf8"));
assert.match(schema.$id, /\\/v8\\.0\\.0\\/schemas\\/v8\\/monsterhearts\\/monsterhearts-playbook\\.schema\\.json$/);
assert.throws(
  () => import.meta.resolve("schema-pbta/schemas/monsterhearts/monsterhearts-playbook.schema.json"),
  { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" },
);

const presentationUrl = import.meta.resolve("schema-pbta/packs/monsterhearts/presentation-contract.json");
assert.deepEqual(
  JSON.parse(fs.readFileSync(new URL(presentationUrl), "utf8")),
  PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION,
  "the package presentation artifact must equal its ESM export",
);

const appearanceUrl = import.meta.resolve("schema-pbta/packs/monsterhearts/appearance-contract.json");
const appearance = JSON.parse(fs.readFileSync(new URL(appearanceUrl), "utf8"));
assert.deepEqual(appearance, PBTA_MONSTERHEARTS_APPEARANCE, "the package appearance artifact must equal its ESM export");
for (const resource of [
  ...Object.values(appearance.resources.fonts),
  ...appearance.resources.stylesheets,
  ...Object.values(appearance.resources.assets),
]) {
  const resourceUrl = import.meta.resolve("schema-pbta/packs/monsterhearts/" + resource);
  assert.ok(fs.statSync(new URL(resourceUrl)).isFile(), "missing exported appearance resource " + resource);
}

const corpusUrl = import.meta.resolve("schema-pbta/corpus/valid/playbook-minimal.toml");
const playbookSource = fs.readFileSync(new URL(corpusUrl), "utf8");
const playbook = PBTA_DOCUMENT_CODECS.playbook.parseToml(playbookSource);
assert.equal(playbook.slug, "quiet-spark");
assert.equal("actorType" in playbook, false);
assert.throws(() =>
  PBTA_DOCUMENT_CODECS.playbook.parseToml(playbookSource + "\\nunexpected = true\\n")
);

const casesUrl = import.meta.resolve("schema-pbta/corpus/cases.json");
const cases = JSON.parse(fs.readFileSync(new URL(casesUrl), "utf8"));
assert.equal(cases.tomlVersion, PBTA_TOML_VERSION);
for (const testCase of cases.cases) {
  const caseUrl = import.meta.resolve("schema-pbta/corpus/" + testCase.path);
  const source = fs.readFileSync(new URL(caseUrl), "utf8");
  const codec = PBTA_DOCUMENT_CODECS[testCase.target];
  assert.ok(codec, "missing codec for " + testCase.target);
  if (testCase.expect === "accept") codec.parseToml(source);
  else assert.throws(() => codec.parseToml(source));
}

// The descriptor is validated by the schema the package publishes, not by hand: a
// consumer reads it the same way the provider does, or the two drift apart silently.
const providerUrl = import.meta.resolve("schema-pbta/cross-tool-provider.json");
const provider = crossToolProviderSchema.parse(
  JSON.parse(fs.readFileSync(new URL(providerUrl), "utf8")),
);
assert.equal(provider.provider, "schema-pbta");
assert.equal(provider.contractVersion, PBTA_CONTRACT_VERSION);
assert.throws(() =>
  crossToolProviderSchema.parse({ ...provider, packManifest: "packs/pack-contract.json" })
);
assert.throws(() => crossToolProviderSchema.parse({ ...provider, unexpected: true }));

// A consumer installed from the tarball must reach every pack contract by the
// path the descriptor advertises; without them it can only check the corpus
// as a whole, never pack by pack.
const [packDirectory, manifestName] = provider.packManifest.split("/*/");
const packIds = fs
  .readdirSync(new URL(packDirectory + "/", providerUrl), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert.ok(packIds.length > 0, "the published tarball carries no pack");

const documented = new Set();
for (const id of packIds) {
  const manifestUrl = import.meta.resolve(
    "schema-pbta/" + packDirectory + "/" + id + "/" + manifestName,
  );
  const manifest = packManifestSchema.parse(
    JSON.parse(fs.readFileSync(new URL(manifestUrl), "utf8")),
  );
  assert.equal(manifest.pack.id, id);
  assert.equal(manifest.contractVersion, PBTA_CONTRACT_VERSION);
  for (const document of manifest.documents) {
    documented.add(document.target);
    const fixtureUrl = import.meta.resolve("schema-pbta/corpus/" + document.fixture);
    const canonical = PBTA_DOCUMENT_CODECS[document.target].parseToml(
      fs.readFileSync(new URL(fixtureUrl), "utf8"),
    );
    assert.equal(
      typeof canonical[document.mutation],
      "string",
      id + ": mutation " + document.mutation + " names no text field",
    );
  }
}

// Coverage is the question the corpus alone could not answer: every
// specialised codec target is documented by a pack the consumer can read.
const genericTargets = new Set(["game-definition", "move", "playbook", "npc", "front"]);
for (const target of Object.keys(PBTA_DOCUMENT_CODECS)) {
  if (genericTargets.has(target)) continue;
  assert.ok(documented.has(target), "no published pack documents " + target);
}

await assert.rejects(
  import("schema-pbta/codecs/toml.js"),
  (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
);
`;
  fs.writeFileSync(path.join(consumerRoot, "check.mjs"), checkSource);
  run(process.execPath, ["check.mjs"], consumerRoot);

  const major = Number(packageJson.version.split(".")[0]);
  if (major >= 1) {
    assert.equal(major, 8, "stable package major must equal PBTA_CONTRACT_VERSION");
  }

  console.log(
    `✓ ${packageJson.name}@${packageJson.version} tarball installs with its public ESM contract`,
  );
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
