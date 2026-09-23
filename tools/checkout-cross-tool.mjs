// Materialises the pinned cross-tool checkouts declared in the configuration.
// Kept dependency-free and outside TypeScript: it runs before any `npm ci`,
// when nothing but node and git is available.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
/* `--paths` lets a caller install every participant without restating the layout. */
const printPaths = args.includes("--paths");
const source = args.find((value) => !value.startsWith("--")) ?? "cross-tool.config.json";
const root = process.cwd();
const raw = JSON.parse(fs.readFileSync(path.resolve(root, source), "utf8"));

function entries(value, role) {
  return (Array.isArray(value) ? value : [value]).map((entry) =>
    typeof entry === "string" ? { role, path: entry } : { role, ...entry },
  );
}

function git(args, cwd = root) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed\n${result.stdout ?? ""}${result.stderr ?? ""}`);
  }
  return result.stdout.trim();
}

const participants = Array.isArray(raw.consumers)
  ? raw.consumers.map((consumer) => ({
    ...consumer,
    repository: `https://github.com/${consumer.repository}.git`,
    ...consumer.proof,
  }))
  : [
    ...entries(raw.providers, "provider"),
    ...entries(raw.lantern, "lantern"),
    ...entries(raw.handbook, "handbook"),
  ];

if (printPaths) {
  for (const participant of participants) console.log(participant.path);
  process.exit(0);
}

for (const participant of participants) {
  // The provider under test is the working tree the job already checked out.
  if (participant.path === ".") continue;
  assert.ok(participant.repository, `${participant.path} declares no repository`);
  assert.match(participant.ref ?? "", /^[0-9a-f]{40}$/, `${participant.path} declares no pinned commit`);

  const target = path.resolve(root, participant.path);
  if (fs.existsSync(path.join(target, ".git"))) {
    // A rerun must land on the same commit, never on whatever the checkout drifted to.
    git(["fetch", "--depth", "1", "origin", participant.ref], target);
  } else {
    fs.mkdirSync(target, { recursive: true });
    git(["init", "--quiet"], target);
    git(["remote", "add", "origin", participant.repository], target);
    git(["fetch", "--depth", "1", "origin", participant.ref], target);
  }
  git(["checkout", "--force", "--detach", participant.ref], target);

  const head = git(["rev-parse", "HEAD"], target);
  assert.equal(head, participant.ref, `${participant.path} landed on ${head}, not on its pin`);
  console.log(`✓ ${participant.path} @ ${participant.ref} (${participant.role})`);
}
