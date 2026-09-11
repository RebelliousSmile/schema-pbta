import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import IarnaToml from "@iarna/toml";
import { parse as parseSmolToml } from "smol-toml";
import { ZodError } from "zod";
import {
  PBTA_DOCUMENT_CODECS,
  type PbtaDocumentTarget,
} from "../src/codecs/toml.js";
import { PBTA_TOML_VERSION } from "../src/contract-version.js";

type ContractExpectation = "accept" | "reject";
interface ContractCase {
  path: string;
  target: PbtaDocumentTarget;
  expect: ContractExpectation;
}
interface ContractManifest {
  manifestVersion: number;
  tomlVersion: string;
  cases: ContractCase[];
}

const root = process.cwd();
const contractRoot = path.join(root, "corpus", "contract");
const manifestPath = path.join(contractRoot, "cases.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ContractManifest;
const targets = Object.keys(PBTA_DOCUMENT_CODECS) as PbtaDocumentTarget[];

assert.equal(manifest.manifestVersion, 1, "contract manifest version must be 1");
assert.equal(
  manifest.tomlVersion,
  PBTA_TOML_VERSION,
  "manifest TOML version differs from the public contract",
);
assert.ok(Array.isArray(manifest.cases), "contract manifest cases must be an array");

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, normalize(child)]),
    );
  }
  return value;
}

function caseFile(relative: string): string {
  assert.ok(
    relative.length > 0 &&
      !path.isAbsolute(relative) &&
      !relative.split(/[\\/]/).includes(".."),
    `unsafe contract case path: ${relative}`,
  );
  const resolved = path.resolve(contractRoot, relative);
  assert.ok(
    resolved.startsWith(`${contractRoot}${path.sep}`),
    `contract case escapes corpus: ${relative}`,
  );
  assert.ok(fs.statSync(resolved).isFile(), `contract case does not exist: ${relative}`);
  return resolved;
}

const seenPaths = new Set<string>();
const coverage = new Map<PbtaDocumentTarget, Set<ContractExpectation>>(
  targets.map((target) => [target, new Set<ContractExpectation>()]),
);

for (const testCase of manifest.cases) {
  assert.ok(
    targets.includes(testCase.target),
    `${testCase.path}: unknown target ${String(testCase.target)}`,
  );
  assert.ok(
    testCase.expect === "accept" || testCase.expect === "reject",
    `${testCase.path}: invalid expectation`,
  );
  assert.ok(!seenPaths.has(testCase.path), `${testCase.path}: duplicate contract path`);
  seenPaths.add(testCase.path);
  coverage.get(testCase.target)?.add(testCase.expect);

  const file = caseFile(testCase.path);
  const source = fs.readFileSync(file, "utf8");
  const codec = PBTA_DOCUMENT_CODECS[testCase.target];
  const label = `${testCase.path} [${testCase.target}]`;

  if (testCase.expect === "reject") {
    assert.throws(
      () => codec.parseToml(source),
      ZodError,
      `${label}: invalid fixture was accepted`,
    );
    console.log(`✓ contract rejection: ${label}`);
    continue;
  }

  const canonical = codec.parseToml(source);
  const reparsed = codec.parseToml(codec.stringifyToml(canonical));
  assert.deepEqual(
    normalize(reparsed),
    normalize(canonical),
    `${label}: canonical round-trip changed the normalized value`,
  );
  assert.deepEqual(
    normalize(parseSmolToml(source)),
    normalize(IarnaToml.parse(source)),
    `${label}: runtime and reference TOML parsers disagree`,
  );
  console.log(`✓ contract witness: ${label}`);
}

for (const target of targets) {
  assert.deepEqual(
    [...(coverage.get(target) ?? [])].sort(),
    ["accept", "reject"],
    `${target}: contract corpus must contain accepted and rejected cases`,
  );
}

console.log("\n✅ Canonical PbtA TOML contract passed all document targets.");
