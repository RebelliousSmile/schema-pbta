import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const [tag, commit] = process.argv.slice(2);
assert.ok(tag && /^v\d+\.\d+\.\d+-rc\.\d+$/.test(tag), "candidate tag must be vX.Y.Z-rc.N");
assert.ok(commit && /^[0-9a-f]{40}$/.test(commit), "candidate commit must be a full SHA");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as { version: string };
assert.equal(tag.replace(/-rc\.\d+$/, ""), `v${pkg.version}`, "candidate tag must match package version");
const git = spawnSync("git", ["merge-base", "--is-ancestor", commit, "origin/main"], { encoding: "utf8" });
assert.equal(git.status, 0, "candidate commit must be an ancestor of origin/main");
console.log(`✓ candidate ${tag} targets ${commit}`);
