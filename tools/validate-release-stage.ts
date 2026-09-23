import assert from "node:assert/strict";
import fs from "node:fs";

const source = process.argv[2] ?? "release-stage.schema-pbta-v8.4.2.json";
const raw = JSON.parse(fs.readFileSync(source, "utf8")) as Record<string, unknown>;
const keys = (value: Record<string, unknown>, expected: string[], label: string) =>
  assert.deepEqual(Object.keys(value).sort(), expected.sort(), `${label} has unexpected or missing fields`);
keys(raw, ["protocol", "candidate"], "staging manifest");
assert.equal(raw.protocol, 1, "staging manifest protocol must be 1");
const candidate = raw.candidate as Record<string, unknown>;
assert.ok(candidate && typeof candidate === "object" && !Array.isArray(candidate), "candidate must be an object");
keys(candidate, ["provider", "releaseUrl", "sha256", "integrity", "version", "stagingTag", "finalTag", "providerCommit"], "candidate");
assert.equal(candidate.provider, "schema-pbta");
assert.match(candidate.sha256 as string, /^[0-9a-f]{64}$/);
assert.match(candidate.integrity as string, /^sha512-[A-Za-z0-9+/]+={0,2}$/);
assert.match(candidate.providerCommit as string, /^[0-9a-f]{40}$/);
assert.match(candidate.version as string, /^\d+\.\d+\.\d+$/);
assert.equal(candidate.finalTag, `v${candidate.version}`);
assert.match(candidate.stagingTag as string, new RegExp(`^v${(candidate.version as string).replaceAll(".", "\\.")}-rc\\.\\d+$`));
const url = new URL(candidate.releaseUrl as string);
assert.equal(url.href, `https://github.com/RebelliousSmile/schema-pbta/releases/download/${candidate.stagingTag}/schema-pbta-${candidate.version}.tgz`);
console.log(`✓ staging manifest names ${candidate.stagingTag}`);
