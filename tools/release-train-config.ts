import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export const RELEASE_TRAIN_PROOF_INTERFACE = "npm-run-release-train-assert" as const;

export type ReleaseTrainConsumerRole = "lantern" | "handbook";

export type ReleaseTrainConsumer = {
  role: ReleaseTrainConsumerRole;
  repository: string;
  ref: string;
  path: string;
  proof: {
    interface: typeof RELEASE_TRAIN_PROOF_INTERFACE;
    manifest: string;
  };
};

export type ReleaseTrainConfig = {
  protocol: 1;
  candidate: {
    provider: "schema-pbta";
    releaseUrl: string;
    sha256: string;
    integrity: string;
    version: string;
    stagingTag: string;
    finalTag: string;
    providerCommit: string;
  };
  consumers: ReleaseTrainConsumer[];
};

export type ReleaseTrainEvidence = {
  protocol: 1;
  status: "passed";
  candidate: ReleaseTrainConfig["candidate"];
  consumer: { role: ReleaseTrainConsumerRole; repository: string; ref: string; resolved: { version: string; releaseUrl: string; integrity: string } };
  lock: { file: string; releaseUrl: string; integrity: string };
  journey: { id: string; status: "passed"; checks: string[] };
};

const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40}$/;
const FINAL_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;
const STAGING_TAG = /^v(\d+)\.(\d+)\.(\d+)-rc\.\d+$/;
const ROLES: ReleaseTrainConsumerRole[] = ["lantern", "handbook"];
const REPOSITORIES: Record<ReleaseTrainConsumerRole, string> = {
  lantern: "RebelliousSmile/lantern",
  handbook: "RebelliousSmile/obsidian-handbook",
};
const REQUIRED_ARTIFACT_CHECKS: Record<ReleaseTrainConsumerRole, readonly string[]> = {
  lantern: ["vite-build", "monsterhearts-four-assets"],
  handbook: ["production-build", "obsidian-plugin-load"],
};

function object(value: unknown, label: string): Record<string, unknown> {
  assert.ok(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  return value as Record<string, unknown>;
}

function string(value: unknown, label: string): string {
  assert.equal(typeof value, "string", `${label} must be a string`);
  return value as string;
}

function exactKeys(value: Record<string, unknown>, keys: string[], label: string): void {
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), `${label} has unexpected or missing fields`);
}

function version(tag: string, pattern: RegExp, label: string): string {
  const match = pattern.exec(tag);
  assert.ok(match, `${label} must be a valid release tag`);
  return `${match[1]}.${match[2]}.${match[3]}`;
}

function readConsumer(value: unknown, index: number): ReleaseTrainConsumer {
  const source = object(value, `consumers[${index}]`);
  exactKeys(source, ["role", "repository", "ref", "path", "proof"], `consumers[${index}]`);
  const role = string(source.role, `consumers[${index}].role`) as ReleaseTrainConsumerRole;
  assert.ok(ROLES.includes(role), `consumers[${index}].role must be lantern or handbook`);
  const repository = string(source.repository, `consumers[${index}].repository`);
  assert.equal(repository, REPOSITORIES[role], `consumers[${index}] must name the canonical ${role} GitHub identity`);
  const ref = string(source.ref, `consumers[${index}].ref`);
  assert.match(ref, COMMIT, `consumers[${index}].ref must be a full commit SHA`);
  const consumerPath = string(source.path, `consumers[${index}].path`);
  assert.match(consumerPath, /^[a-z][a-z0-9-]*$/, `consumers[${index}].path must be a safe workspace name`);
  const proof = object(source.proof, `consumers[${index}].proof`);
  exactKeys(proof, ["interface", "manifest"], `consumers[${index}].proof`);
  assert.equal(proof.interface, RELEASE_TRAIN_PROOF_INTERFACE, `consumers[${index}] uses an unsupported proof interface`);
  const manifest = string(proof.manifest, `consumers[${index}].proof.manifest`);
  assert.match(manifest, /^[a-z][a-z0-9.-]*(?:\/[a-z][a-z0-9.-]*)*\.json$/, `consumers[${index}].proof.manifest must be a safe JSON path`);
  return { role, repository, ref, path: consumerPath, proof: { interface: RELEASE_TRAIN_PROOF_INTERFACE, manifest } };
}

export function parseReleaseTrainConfig(raw: unknown): ReleaseTrainConfig {
  const source = object(raw, "release train");
  exactKeys(source, ["protocol", "candidate", "consumers"], "release train");
  assert.equal(source.protocol, 1, "release train protocol must be 1");
  const candidate = object(source.candidate, "candidate");
  exactKeys(candidate, ["provider", "releaseUrl", "sha256", "integrity", "version", "stagingTag", "finalTag", "providerCommit"], "candidate");
  assert.equal(candidate.provider, "schema-pbta", "candidate.provider must be schema-pbta");
  const releaseUrl = string(candidate.releaseUrl, "candidate.releaseUrl");
  const sha256 = string(candidate.sha256, "candidate.sha256");
  const integrity = string(candidate.integrity, "candidate.integrity");
  const candidateVersion = string(candidate.version, "candidate.version");
  const stagingTag = string(candidate.stagingTag, "candidate.stagingTag");
  const finalTag = string(candidate.finalTag, "candidate.finalTag");
  const providerCommit = string(candidate.providerCommit, "candidate.providerCommit");
  assert.match(sha256, SHA256, "candidate.sha256 must be a lowercase SHA-256");
  assert.match(integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/, "candidate.integrity must be an npm SHA-512 SRI value");
  assert.match(providerCommit, COMMIT, "candidate.providerCommit must be a full commit SHA");
  const finalVersion = version(finalTag, FINAL_TAG, "candidate.finalTag");
  assert.equal(candidateVersion, finalVersion, "candidate.version must match candidate.finalTag");
  assert.equal(version(stagingTag, STAGING_TAG, "candidate.stagingTag"), finalVersion, "candidate tags must name the same final version");
  const url = new URL(releaseUrl);
  assert.equal(url.protocol, "https:", "candidate.releaseUrl must use HTTPS");
  assert.equal(url.hostname, "github.com", "candidate.releaseUrl must be a GitHub release asset");
  assert.equal(url.pathname, `/RebelliousSmile/schema-pbta/releases/download/${stagingTag}/schema-pbta-${finalVersion}.tgz`, "candidate.releaseUrl must identify the staged final-version archive");
  assert.equal(url.search, "", "candidate.releaseUrl must not carry mutable query parameters");
  assert.equal(url.hash, "", "candidate.releaseUrl must not carry a fragment");

  assert.ok(Array.isArray(source.consumers), "consumers must be a list");
  assert.equal(source.consumers.length, ROLES.length, "consumers must name Lantern and Handbook exactly once");
  const consumers = source.consumers.map(readConsumer);
  assert.deepEqual(consumers.map((consumer) => consumer.role).sort(), [...ROLES].sort(), "consumers must name Lantern and Handbook exactly once");
  assert.equal(new Set(consumers.map((consumer) => consumer.path)).size, consumers.length, "consumers must use distinct workspace paths");
  return { protocol: 1, candidate: { provider: "schema-pbta", releaseUrl, sha256, integrity, version: candidateVersion, stagingTag, finalTag, providerCommit }, consumers };
}

export function readReleaseTrainConfig(source: string): ReleaseTrainConfig {
  return parseReleaseTrainConfig(JSON.parse(fs.readFileSync(path.resolve(process.cwd(), source), "utf8")));
}

export function parseReleaseTrainEvidence(raw: unknown, consumer: ReleaseTrainConsumer, candidate: ReleaseTrainConfig["candidate"]): ReleaseTrainEvidence {
  const source = object(raw, `${consumer.role} proof evidence`);
  exactKeys(source, ["protocol", "status", "candidate", "consumer", "lock", "journey"], `${consumer.role} proof evidence`);
  assert.equal(source.protocol, 1, `${consumer.role} proof evidence protocol must be 1`);
  assert.equal(source.status, "passed", `${consumer.role} proof did not pass`);
  assert.deepEqual(source.candidate, candidate, `${consumer.role} proof names another candidate`);
  const consumerEvidence = object(source.consumer, `${consumer.role} proof consumer`);
  exactKeys(consumerEvidence, ["role", "repository", "ref", "resolved"], `${consumer.role} proof consumer`);
  assert.equal(consumerEvidence.role, consumer.role, `${consumer.role} proof names another role`);
  assert.equal(consumerEvidence.repository, consumer.repository, `${consumer.role} proof names another repository`);
  assert.equal(consumerEvidence.ref, consumer.ref, `${consumer.role} proof names another commit`);
  const resolved = object(consumerEvidence.resolved, `${consumer.role} resolved package`);
  exactKeys(resolved, ["version", "releaseUrl", "integrity"], `${consumer.role} resolved package`);
  assert.equal(resolved.version, candidate.version, `${consumer.role} proof resolved another version`);
  assert.equal(resolved.releaseUrl, candidate.releaseUrl, `${consumer.role} proof resolved another release URL`);
  assert.equal(resolved.integrity, candidate.integrity, `${consumer.role} proof resolved another integrity`);
  const lock = object(source.lock, `${consumer.role} lock evidence`);
  exactKeys(lock, ["file", "releaseUrl", "integrity"], `${consumer.role} lock evidence`);
  assert.match(string(lock.file, `${consumer.role} lock file`), /^(?:pnpm-lock\.yaml|package-lock\.json)$/);
  assert.equal(lock.releaseUrl, candidate.releaseUrl, `${consumer.role} lock resolves another release URL`);
  assert.equal(lock.integrity, candidate.integrity, `${consumer.role} lock resolves another integrity`);
  const journey = object(source.journey, `${consumer.role} journey`);
  exactKeys(journey, ["id", "status", "checks"], `${consumer.role} journey`);
  assert.match(string(journey.id, `${consumer.role} journey id`), /^[a-z][a-z0-9-]*$/);
  assert.equal(journey.status, "passed", `${consumer.role} journey did not pass`);
  assert.ok(Array.isArray(journey.checks) && journey.checks.length > 0 && journey.checks.every((check) => typeof check === "string"), `${consumer.role} journey must name checks`);
  const checks = journey.checks as string[];
  assert.equal(new Set(checks).size, checks.length, `${consumer.role} journey has duplicate checks`);
  for (const required of REQUIRED_ARTIFACT_CHECKS[consumer.role]) {
    assert.ok(checks.includes(required), `${consumer.role} journey is missing required artifact check ${required}`);
  }
  return {
    protocol: 1,
    status: "passed",
    candidate,
    consumer: { role: consumer.role, repository: consumer.repository, ref: consumer.ref, resolved: { version: candidate.version, releaseUrl: candidate.releaseUrl, integrity: candidate.integrity } },
    lock: { file: lock.file as string, releaseUrl: candidate.releaseUrl, integrity: candidate.integrity },
    journey: { id: journey.id as string, status: "passed", checks },
  };
}
