import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { parseReleaseTrainEvidence, readReleaseTrainConfig } from "./release-train-config.js";

const root = process.cwd();
const args = process.argv.slice(2);
const source = args.find((argument) => !argument.startsWith("--")) ?? "cross-tool.release-train.fixture.json";

function option(name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  assert.ok(value && !value.startsWith("--"), `${name} requires a value`);
  return value;
}

function run(command: string, commandArgs: string[], cwd: string): void {
  const result = spawnSync(command, commandArgs, { cwd, encoding: "utf8", stdio: "inherit", shell: false });
  if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(" ")} failed`);
}

function sha256(file: string): string {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

async function download(url: string, destination: string): Promise<void> {
  const response = await fetch(url, { redirect: "error" });
  assert.ok(response.ok, `candidate archive download failed: ${response.status} ${response.statusText}`);
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

function installDependencies(consumerRoot: string): void {
  if (fs.existsSync(path.join(consumerRoot, "pnpm-lock.yaml"))) {
    run("npx", ["--yes", "pnpm@10", "install", "--frozen-lockfile"], consumerRoot);
  } else if (fs.existsSync(path.join(consumerRoot, "package-lock.json"))) {
    run("npm", ["ci"], consumerRoot);
  } else {
    run("npm", ["install", "--no-audit", "--no-fund"], consumerRoot);
  }
}

async function main(): Promise<void> {
  const train = readReleaseTrainConfig(source);
  const workspace = path.resolve(option("--workspace") ?? fs.mkdtempSync(path.join(os.tmpdir(), "schema-pbta-release-train-")));
  const output = path.resolve(option("--output") ?? path.join(workspace, "release-train.provenance.json"));
  const suppliedArchive = option("--archive");
  fs.mkdirSync(workspace, { recursive: true });
  const archive = suppliedArchive ? path.resolve(suppliedArchive) : path.join(workspace, `schema-pbta-${train.candidate.finalTag.slice(1)}.tgz`);
  if (!suppliedArchive) await download(train.candidate.releaseUrl, archive);
  assert.ok(fs.statSync(archive).isFile(), `candidate archive is missing: ${archive}`);
  assert.equal(sha256(archive), train.candidate.sha256, "candidate archive does not match its declared SHA-256");

  run(process.execPath, [path.join(root, "tools", "checkout-cross-tool.mjs"), path.resolve(source)], workspace);
  const evidence = [];
  for (const consumer of train.consumers) {
    const consumerRoot = path.join(workspace, consumer.path);
    installDependencies(consumerRoot);
    // Install the verified bytes without changing the committed lockfile. The consumer proof
    // independently proves that its active lock also names this release URL and integrity.
    run("npm", ["install", "--no-save", "--package-lock=false", "--ignore-scripts", archive], consumerRoot);
    const manifest = path.join(consumerRoot, consumer.proof.manifest);
    fs.mkdirSync(path.dirname(manifest), { recursive: true });
    const evidencePath = `${manifest}.evidence.json`;
    fs.writeFileSync(manifest, JSON.stringify({ protocol: 1, candidate: train.candidate, consumer: { role: consumer.role, repository: consumer.repository, ref: consumer.ref }, evidencePath }, null, 2));
    run("npm", ["run", "release-train:assert", "--", consumer.proof.manifest], consumerRoot);
    assert.ok(fs.existsSync(evidencePath), `${consumer.role} proof wrote no evidence at ${path.relative(consumerRoot, evidencePath)}`);
    evidence.push(parseReleaseTrainEvidence(JSON.parse(fs.readFileSync(evidencePath, "utf8")), consumer, train.candidate));
  }
  fs.writeFileSync(output, JSON.stringify({ protocol: 1, candidate: train.candidate, consumers: evidence }, null, 2));
  console.log(`✓ release train evidence written to ${output}`);
}

await main();
