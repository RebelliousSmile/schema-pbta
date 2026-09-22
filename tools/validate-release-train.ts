import assert from "node:assert/strict";

import { parseReleaseTrainConfig, readReleaseTrainConfig } from "./release-train-config.js";

const source = process.argv[2] ?? "cross-tool.release-train.fixture.json";
const train = readReleaseTrainConfig(source);

assert.throws(
  () => parseReleaseTrainConfig({ ...train, consumers: train.consumers.slice(0, 1) }),
  /Lantern and Handbook exactly once/,
);
assert.throws(
  () => parseReleaseTrainConfig({ ...train, consumers: train.consumers.map((consumer) => ({ ...consumer, ref: "main" })) }),
  /full commit SHA/,
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
