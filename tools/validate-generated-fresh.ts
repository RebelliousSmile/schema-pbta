import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Runs the npm scripts it is given (the generators) and fails when they changed
// a file of the checkout. A generator overwrites its output: without this a
// hand edit of a generated file is erased and the check stays green, while the
// commit holds something the package does not publish.
//
//   tsx tools/validate-generated-fresh.ts gen handbook:render

const root = process.cwd();
const scripts = process.argv.slice(2);
if (scripts.length === 0) {
  console.error("usage: validate-generated-fresh <npm script>...");
  process.exit(2);
}

function listFiles(): string[] {
  const result = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`git ls-files failed\n${result.stderr ?? ""}`);
  return result.stdout.split("\0").filter(Boolean);
}

function snapshot(): Map<string, string> {
  const hashes = new Map<string, string>();
  for (const file of listFiles()) {
    const full = path.join(root, file);
    // A nested checkout (the runner puts Handbook inside the workspace) is listed as a directory: it is not this repository's content.
    if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) continue;
    // A generator writes LF; a checkout with autocrlf holds CRLF. Only the content is compared.
    const content = fs.readFileSync(full).toString("latin1").replace(/\r\n/g, "\n");
    hashes.set(file, createHash("sha256").update(content, "latin1").digest("hex"));
  }
  return hashes;
}

const before = snapshot();
for (const script of scripts) {
  const run = spawnSync("npm", ["run", script], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (run.status !== 0) {
    console.error(`validate-generated-fresh: npm run ${script} failed`);
    process.exit(run.status ?? 1);
  }
}
const after = snapshot();

const changed = [...new Set([...before.keys(), ...after.keys()])]
  .filter((file) => before.get(file) !== after.get(file))
  .sort();
if (changed.length > 0) {
  console.error(
    `validate-generated-fresh: ${scripts.join(" + ")} changed ${changed.length} file(s) of the checkout:\n` +
      changed.map((file) => `  ${file}`).join("\n") +
      "\nA generated file is edited at its source, never by hand. The files are now regenerated: commit them, then run the check again.",
  );
  process.exit(1);
}
console.log(`validate-generated-fresh: ${scripts.join(" + ")} left the checkout unchanged`);
