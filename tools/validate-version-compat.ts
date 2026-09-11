import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  PBTA_CONTRACT_SCHEMA_TAG,
  PBTA_CONTRACT_VERSION,
} from "../src/contract-version";

const root = process.cwd();
const schemaRoot = `schemas/v${PBTA_CONTRACT_VERSION}`;
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  version: string;
};

function git(args: string[], allowFailure = false): string | null {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    if (allowFailure) return null;
    throw new Error(`git ${args.join(" ")} failed\n${result.stderr ?? ""}`);
  }
  return result.stdout;
}

const packageMajor = Number(packageJson.version.split(".")[0]);
assert.equal(
  packageMajor,
  PBTA_CONTRACT_VERSION,
  "stable package major must equal PBTA_CONTRACT_VERSION",
);
assert.equal(
  PBTA_CONTRACT_SCHEMA_TAG,
  `v${PBTA_CONTRACT_VERSION}.0.0`,
  "a schema major must start from its exact immutable x.0.0 release tag",
);

const publishedCommit = git(
  ["rev-parse", "--verify", `${PBTA_CONTRACT_SCHEMA_TAG}^{commit}`],
  true,
);
if (publishedCommit === null) {
  console.log(
    `✓ ${PBTA_CONTRACT_SCHEMA_TAG} is not published yet; committed ${schemaRoot} is the candidate baseline`,
  );
  process.exit(0);
}

const publishedFiles = (git([
  "ls-tree",
  "-r",
  "--name-only",
  PBTA_CONTRACT_SCHEMA_TAG,
  schemaRoot,
]) ?? "")
  .trim()
  .split("\n")
  .filter(Boolean)
  .sort();
const currentFiles = fs
  .readdirSync(path.join(root, schemaRoot), { recursive: true, encoding: "utf8" })
  .filter((relative) => relative.endsWith(".schema.json"))
  .map((relative) => path.posix.join(schemaRoot, relative.replaceAll(path.sep, "/")))
  .sort();

assert.deepEqual(
  currentFiles,
  publishedFiles,
  `${schemaRoot} file list differs from immutable ${PBTA_CONTRACT_SCHEMA_TAG}; create a new schema major`,
);
for (const relative of currentFiles) {
  const published = git(["show", `${PBTA_CONTRACT_SCHEMA_TAG}:${relative}`]);
  const current = fs.readFileSync(path.join(root, relative), "utf8");
  assert.equal(
    current,
    published,
    `${relative} differs from immutable ${PBTA_CONTRACT_SCHEMA_TAG}; create a new schema major`,
  );
}

console.log(
  `✓ ${schemaRoot} is byte-for-byte compatible with ${PBTA_CONTRACT_SCHEMA_TAG} (${publishedCommit.trim()})`,
);
