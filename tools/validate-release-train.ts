import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { parseReleaseTrainConfig, parseReleaseTrainEvidence, readReleaseTrainConfig } from "./release-train-config.js";
import type { ReleaseTrainConfig } from "./release-train-config.js";

const source = process.argv[2] ?? "cross-tool.release-train.fixture.json";
const train = readReleaseTrainConfig(source);
if (path.basename(source) !== "cross-tool.release-train.fixture.json") {
  const stage = JSON.parse(fs.readFileSync(path.resolve(`release-stage.schema-pbta-v${train.candidate.version}.json`), "utf8")) as { candidate?: unknown };
  const record = JSON.parse(fs.readFileSync(path.resolve(`release-train/candidates/schema-pbta-${train.candidate.stagingTag}.json`), "utf8")) as { candidate?: unknown };
  assert.deepEqual(stage.candidate, train.candidate, "release train candidate differs from staged patch record");
  assert.deepEqual(record.candidate, train.candidate, "release train candidate differs from immutable RC record");
}
const requiredChecks = {
  lantern: ["frozen-install", "vite-build", "monsterhearts-four-assets"],
  handbook: ["frozen-install", "commonjs-plugin-build", "obsidian-1.13.7-plugin-load"],
} as const;

assert.throws(
  () => parseReleaseTrainConfig({ ...train, consumers: train.consumers.slice(0, 1) }),
  /Lantern and Handbook exactly once/,
);
function rawEvidence(consumer: ReleaseTrainConfig["consumers"][number], checks: string[]) {
  return {
    protocol: 1,
    status: "passed",
    candidate: train.candidate,
    consumer: { role: consumer.role, repository: consumer.repository, ref: consumer.ref, resolved: { version: train.candidate.version, releaseUrl: train.candidate.releaseUrl, integrity: train.candidate.integrity } },
    lock: { file: "pnpm-lock.yaml", releaseUrl: train.candidate.releaseUrl, integrity: train.candidate.integrity },
    journey: { id: "candidate-adoption", status: "passed", checks },
  };
}

for (const consumer of train.consumers) {
  const checks = [...requiredChecks[consumer.role]];
  const accepted = parseReleaseTrainEvidence(rawEvidence(consumer, checks), consumer, train.candidate);
  assert.deepEqual(accepted.journey.checks, checks);
  for (const required of requiredChecks[consumer.role].slice(1)) {
    assert.throws(
      () => parseReleaseTrainEvidence(rawEvidence(consumer, checks.filter((check) => check !== required)), consumer, train.candidate),
      new RegExp(`missing required host-artifact check ${required}`),
    );
  }
  assert.throws(
    () => parseReleaseTrainEvidence(rawEvidence(consumer, [...checks, checks[0]]), consumer, train.candidate),
    /checks must be unique/,
  );
}

const consumer = train.consumers[0];
const evidence = parseReleaseTrainEvidence(rawEvidence(consumer, [...requiredChecks[consumer.role]]), consumer, train.candidate);
assert.throws(
  () => parseReleaseTrainEvidence({ ...evidence, candidate: { ...evidence.candidate, sha256: "f".repeat(64) } }, consumer, train.candidate),
  /another candidate/,
);
assert.throws(
  () => parseReleaseTrainEvidence({ ...evidence, journey: { ...evidence.journey, status: "failed" } }, consumer, train.candidate),
  /journey did not pass/,
);
assert.throws(
  () => parseReleaseTrainConfig({ ...train, consumers: train.consumers.map((consumer) => ({ ...consumer, ref: "main" })) }),
  /full commit SHA/,
);
assert.throws(
  () => parseReleaseTrainConfig({ ...train, candidate: { ...train.candidate, integrity: "sha512-not-base64!" } }),
  /npm SHA-512 SRI/,
);
assert.throws(
  () => parseReleaseTrainConfig({ ...train, candidate: { ...train.candidate, releaseUrl: train.candidate.releaseUrl.replace(train.candidate.stagingTag, train.candidate.finalTag) } }),
  /staged final-version archive/,
);
assert.throws(
  () => parseReleaseTrainConfig({ ...train, consumers: train.consumers.map((consumer) => ({ ...consumer, proof: { ...consumer.proof, interface: "sh -c" } })) }),
  /unsupported proof interface/,
);

console.log(`✓ release train stages ${train.candidate.finalTag} from ${train.candidate.stagingTag} for ${train.consumers.map((consumer) => consumer.role).join(" and ")}`);
