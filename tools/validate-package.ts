import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "schema-pbta-package-"));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  name: string;
  version: string;
};

function run(command: string, args: string[], cwd = root): string {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout ?? ""}${result.stderr ?? ""}`,
    );
  }
  return result.stdout;
}

try {
  const packOutput = run("npm", [
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
  const tarball = path.join(temporaryRoot, packed[0].filename);

  const consumerRoot = path.join(temporaryRoot, "consumer");
  fs.mkdirSync(consumerRoot);
  fs.writeFileSync(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run(
    "npm",
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
    consumerRoot,
  );

  const checkSource = `
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PBTA_CONTRACT_VERSION,
  PBTA_DOCUMENT_CODECS,
  PBTA_TOML_VERSION,
  parseFrontToml,
  parseGameDefinitionToml,
  parseMoveToml,
  parseNpcToml,
  parsePlaybookToml,
} from "schema-pbta";

assert.equal(PBTA_CONTRACT_VERSION, 1);
assert.equal(PBTA_TOML_VERSION, "1.0.0");
assert.deepEqual(Object.keys(PBTA_DOCUMENT_CODECS).sort(), [
  "front", "game-definition", "move", "npc", "playbook",
]);
for (const parser of [
  parseFrontToml,
  parseGameDefinitionToml,
  parseMoveToml,
  parseNpcToml,
  parsePlaybookToml,
]) assert.equal(typeof parser, "function");

const schemaUrl = import.meta.resolve("schema-pbta/schemas/v1/masks/playbook.schema.json");
const schema = JSON.parse(fs.readFileSync(new URL(schemaUrl), "utf8"));
assert.match(schema.$id, /\\/v1\\/schemas\\/v1\\/masks\\/playbook\\.schema\\.json$/);

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

await assert.rejects(
  import("schema-pbta/codecs/toml.js"),
  (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
);
`;
  fs.writeFileSync(path.join(consumerRoot, "check.mjs"), checkSource);
  run(process.execPath, ["check.mjs"], consumerRoot);

  const major = Number(packageJson.version.split(".")[0]);
  if (major >= 1) {
    assert.equal(major, 1, "stable npm package major must equal PBTA_CONTRACT_VERSION");
  }

  console.log(
    `✓ ${packageJson.name}@${packageJson.version} tarball installs with its public ESM contract`,
  );
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
