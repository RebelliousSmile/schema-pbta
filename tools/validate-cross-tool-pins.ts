import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { readCrossToolParticipants } from "./cross-tool-config.js";

const CONFIG = "cross-tool.config.json";
const WORKFLOW = ".github/workflows/ci.yml";
const CHECKOUT = "tools/checkout-cross-tool.mjs";

const root = process.cwd();
const participants = readCrossToolParticipants(CONFIG);

/* The provider under test is the working tree itself: CI validates the commit it checked out, never a pin. */
const underTest = participants.filter((participant) => participant.path === ".");
assert.equal(underTest.length, 1, `${CONFIG} must declare exactly one provider under test, the "." checkout`);
assert.equal(underTest[0].role, "provider", `the "." checkout must be a provider`);
assert.equal(underTest[0].repository, undefined, `the provider under test must not declare a repository`);
assert.equal(underTest[0].ref, undefined, `the provider under test must not declare a ref`);

const seen = new Set<string>();
for (const participant of participants) {
  assert.ok(!seen.has(participant.path), `${CONFIG} declares ${participant.path} twice`);
  seen.add(participant.path);
  if (participant.path === ".") continue;

  /* A participant with no origin cannot be materialised anywhere but this machine. */
  assert.ok(participant.repository, `${participant.path} declares no repository, so CI cannot check it out`);
  assert.match(
    participant.repository,
    /^https:\/\/github\.com\/[^/]+\/[^/]+\.git$/,
    `${participant.path} repository must be an https GitHub clone URL: ${participant.repository}`,
  );

  /* A branch name would make the gate report a different result tomorrow for the same commit. */
  assert.ok(participant.ref, `${participant.path} declares no ref, so its checkout would drift`);
  assert.match(
    participant.ref,
    /^[0-9a-f]{40}$/,
    `${participant.path} ref must be a full commit sha, not a mutable name: ${participant.ref}`,
  );
}

/* Three provider families and both hosts: a matrix missing one of them proves less than it claims. */
const roles = participants.map((participant) => participant.role);
assert.ok(roles.filter((role) => role === "provider").length >= 3, `${CONFIG} must declare all three schema providers`);
assert.equal(roles.filter((role) => role === "lantern").length, 1, `${CONFIG} must declare one Lantern checkout`);
assert.equal(roles.filter((role) => role === "handbook").length, 1, `${CONFIG} must declare one Handbook checkout`);

/* The gate only exists if the workflow runs it: read the job rather than trusting that it is still there. */
const workflow = fs.readFileSync(path.join(root, WORKFLOW), "utf8");
assert.match(workflow, /^\s{2}contract:$/m, `${WORKFLOW} declares no contract job`);
const runs = (command: string) =>
  workflow.split(/\r?\n/).some((line) => line.trim() === `run: ${command}`);
assert.ok(
  runs(`node ${CHECKOUT} ${CONFIG}`),
  `${WORKFLOW} must materialise the pinned checkouts with "node ${CHECKOUT} ${CONFIG}"`,
);
assert.ok(
  runs(`npm run validate:cross-tool -- ${CONFIG}`),
  `${WORKFLOW} must run the orchestrator with "npm run validate:cross-tool -- ${CONFIG}"`,
);
assert.ok(fs.statSync(path.join(root, CHECKOUT)).isFile(), `missing ${CHECKOUT}`);

console.log(
  `✓ ${participants.length} cross-tool checkouts are pinned and the ${WORKFLOW} contract job runs them.`,
);
