import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readCrossToolConfig } from "./cross-tool-config.js";

const config = readCrossToolConfig(process.argv[2]);
for (const [name, root] of Object.entries(config)) assert.ok(fs.existsSync(path.join(root, "package.json")), `${name} checkout is missing package.json: ${root}`);
const provider = JSON.parse(fs.readFileSync(path.join(config.schema, "cross-tool-provider.json"), "utf8")) as Record<string, unknown>;
assert.equal(provider.providerVersion, 1, "unsupported provider descriptor");
assert.equal(typeof provider.provider, "string", "provider descriptor needs a provider id");
const commands = provider.commands as Record<string, unknown>;
assert.ok(commands && Array.isArray(commands.validatePack) && commands.validatePack.every((part) => typeof part === "string"), "provider descriptor needs commands.validatePack");
const validatePack = commands.validatePack as string[];
const run = (cwd: string, ...args: string[]) => execFileSync("npm", args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
const runCommand = (cwd: string, command: string[]) => execFileSync(command[0], command.slice(1), { cwd, stdio: "inherit", shell: process.platform === "win32" });
for (const entry of fs.readdirSync(path.join(config.schema, "packs"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifest = path.join("packs", entry.name, "pack-contract.json");
  if (fs.existsSync(path.join(config.schema, manifest))) runCommand(config.schema, [...validatePack, manifest]);
}
run(config.lantern, "run", "assert:contracts");
execFileSync(process.execPath, ["tools/assert-pbta-contract.mjs"], { cwd: config.handbook, stdio: "inherit" });
console.log("✅ Cross-tool contract passed.");
