import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readCrossToolConfig } from "./cross-tool-config.js";

const config = readCrossToolConfig(process.argv[2]);
for (const root of [...config.providers, config.lantern, config.handbook]) assert.ok(fs.existsSync(path.join(root, "package.json")), `checkout is missing package.json: ${root}`);
const run = (cwd: string, ...args: string[]) => execFileSync("npm", args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
const runCommand = (cwd: string, command: string[]) => execFileSync(command[0], command.slice(1), { cwd, stdio: "inherit", shell: process.platform === "win32" });
for (const root of config.providers) {
  const provider = JSON.parse(fs.readFileSync(path.join(root, "cross-tool-provider.json"), "utf8")) as Record<string, unknown>;
  assert.equal(provider.providerVersion, 1, `${root}: unsupported provider descriptor`);
  const commands = provider.commands as Record<string, unknown>;
  assert.ok(commands && Array.isArray(commands.validatePack) && commands.validatePack.every((part) => typeof part === "string"), `${root}: missing validatePack command`);
  const packs = provider.provider === "schema-pbta" ? path.join(root, "packs") : path.join(root, "handbook");
  for (const entry of fs.readdirSync(packs, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = provider.provider === "schema-pbta" ? path.join("packs", entry.name, "pack-contract.json") : path.join("handbook", entry.name, "pack.json");
    if (fs.existsSync(path.join(root, manifest))) runCommand(root, [...commands.validatePack as string[], manifest]);
  }
}
run(config.lantern, "run", "assert:contracts");
execFileSync(process.execPath, ["tools/assert-pbta-contract.mjs"], { cwd: config.handbook, stdio: "inherit" });
console.log("✅ Cross-tool contract passed.");
