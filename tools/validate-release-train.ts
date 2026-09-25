import assert from "node:assert/strict";

import { parseReleaseTrainConfig, parseReleaseTrainEvidence, readReleaseTrainConfig } from "./release-train-config.js";

const source = process.argv[2] ?? "cross-tool.release-train.fixture.json";
const train = readReleaseTrainConfig(source);

assert.throws(
  () => parseReleaseTrainConfig({ ...train, consumers: train.consumers.slice(0, 1) }),
  /Lantern and Handbook exactly once/,
);
const evidence = parseReleaseTrainEvidence({
  protocol: 1,
  status: "passed",
  candidate: train.candidate,
  consumer: { role: train.consumers[0].role, repository: train.consumers[0].repository, ref: train.consumers[0].ref, resolved: { version: train.candidate.version, releaseUrl: train.candidate.releaseUrl, integrity: train.candidate.integrity } },
  lock: { file: "pnpm-lock.yaml", releaseUrl: train.candidate.releaseUrl, integrity: train.candidate.integrity },
  journey: { id: "candidate-adoption", status: "passed", checks: ["frozen-install", "vite-build", "monsterhearts-four-assets"] },
}, train.consumers[0], train.candidate);
const handbook = train.consumers.find((consumer) => consumer.role === "handbook");
assert.ok(handbook);
const handbookEvidence = parseReleaseTrainEvidence({
  ...evidence,
  consumer: { ...evidence.consumer, role: handbook.role, repository: handbook.repository, ref: handbook.ref },
  journey: { ...evidence.journey, checks: ["frozen-install", "production-build", "obsidian-plugin-load"] },
}, handbook, train.candidate);
for (const required of ["vite-build", "monsterhearts-four-assets"]) {
  assert.throws(
    () => parseReleaseTrainEvidence({ ...evidence, journey: { ...evidence.journey, checks: evidence.journey.checks.filter((check) => check !== required) } }, train.consumers[0], train.candidate),
    /missing required artifact check/,
  );
}
for (const required of ["production-build", "obsidian-plugin-load"]) {
  assert.throws(
    () => parseReleaseTrainEvidence({ ...handbookEvidence, journey: { ...handbookEvidence.journey, checks: handbookEvidence.journey.checks.filter((check) => check !== required) } }, handbook, train.candidate),
    /missing required artifact check/,
  );
}
assert.throws(
  () => parseReleaseTrainEvidence({ ...evidence, journey: { ...evidence.journey, checks: [...evidence.journey.checks, "vite-build"] } }, train.consumers[0], train.candidate),
  /duplicate checks/,
);
assert.throws(
  () => parseReleaseTrainEvidence({ ...evidence, candidate: { ...evidence.candidate, sha256: "f".repeat(64) } }, train.consumers[0], train.candidate),
  /another candidate/,
);
assert.throws(
  () => parseReleaseTrainEvidence({ ...evidence, journey: { ...evidence.journey, status: "failed" } }, train.consumers[0], train.candidate),
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
