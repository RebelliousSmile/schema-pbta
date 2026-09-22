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
  candidate: {
    releaseUrl: string;
    sha256: string;
    stagingTag: string;
    finalTag: string;
    providerCommit: string;
  };
  consumers: ReleaseTrainConsumer[];
};

const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40}$/;
const FINAL_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;
const STAGING_TAG = /^v(\d+)\.(\d+)\.(\d+)-rc\.\d+$/;
const ROLES: ReleaseTrainConsumerRole[] = ["lantern", "handbook"];
const REPOSITORIES: Record<ReleaseTrainConsumerRole, string> = {
  lantern: "https://github.com/RebelliousSmile/lantern.git",
  handbook: "https://github.com/RebelliousSmile/obsidian-handbook.git",
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
  assert.equal(repository, REPOSITORIES[role], `consumers[${index}] must name the canonical ${role} repository`);
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
  exactKeys(source, ["candidate", "consumers"], "release train");
  const candidate = object(source.candidate, "candidate");
  exactKeys(candidate, ["releaseUrl", "sha256", "stagingTag", "finalTag", "providerCommit"], "candidate");
  const releaseUrl = string(candidate.releaseUrl, "candidate.releaseUrl");
  const sha256 = string(candidate.sha256, "candidate.sha256");
  const stagingTag = string(candidate.stagingTag, "candidate.stagingTag");
  const finalTag = string(candidate.finalTag, "candidate.finalTag");
  const providerCommit = string(candidate.providerCommit, "candidate.providerCommit");
  assert.match(sha256, SHA256, "candidate.sha256 must be a lowercase SHA-256");
  assert.match(providerCommit, COMMIT, "candidate.providerCommit must be a full commit SHA");
  const finalVersion = version(finalTag, FINAL_TAG, "candidate.finalTag");
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
  return { candidate: { releaseUrl, sha256, stagingTag, finalTag, providerCommit }, consumers };
}

export function readReleaseTrainConfig(source: string): ReleaseTrainConfig {
  return parseReleaseTrainConfig(JSON.parse(fs.readFileSync(path.resolve(process.cwd(), source), "utf8")));
}
