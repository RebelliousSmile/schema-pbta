import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
for (const entry of fs.readdirSync(path.join(root, "packs"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifest = path.join("packs", entry.name, "pack-contract.json");
  if (!fs.existsSync(path.join(root, manifest))) continue;
  execFileSync("npm", ["run", "validate:pack", "--", manifest], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
}
