import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readCrossToolConfig } from "./cross-tool-config.js";

const config = readCrossToolConfig(process.argv[2]);
for (const [name, root] of Object.entries(config)) assert.ok(fs.existsSync(path.join(root, "package.json")), `${name} checkout is missing package.json: ${root}`);
const provider = JSON.parse(fs.readFileSync(path.join(config.schema, "cross-tool-provider.json"), "utf8")) as Record<string, unknown>;
assert.equal(provider.providerVersion, 1, "unsupported provider descriptor");
assert.equal(provider.provider, "schema-pbta", "this runner requires a schema-pbta provider");
const run = (cwd: string, ...args: string[]) => execFileSync("npm", args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
for (const entry of fs.readdirSync(path.join(config.schema, "packs"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifest = path.join("packs", entry.name, "pack-contract.json");
  if (fs.existsSync(path.join(config.schema, manifest))) run(config.schema, "run", "validate:pack", "--", manifest);
}
run(config.lantern, "run", "assert:contracts");
execFileSync(process.execPath, ["tools/assert-pbta-contract.mjs"], { cwd: config.handbook, stdio: "inherit" });
console.log("✅ Cross-tool contract passed.");
