import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { packManifestSchema } from "../src/pack-manifest.js";

const args = process.argv.slice(2);
const write = args[0] === "--write";
const source = args[write ? 1 : 0];
assert.ok(source, "usage: npm run create:pack -- [--write] <pack-contract.json>");
const manifest = packManifestSchema.parse(JSON.parse(fs.readFileSync(path.resolve(source), "utf8")));
const destination = path.join(process.cwd(), "packs", manifest.pack.id, "pack-contract.json");
assert.ok(path.resolve(destination).startsWith(`${path.resolve(process.cwd(), "packs")}${path.sep}`), "unsafe pack destination");
if (!write) {
  console.log(JSON.stringify({ write: false, files: [destination], next: "rerun with --write to create the pack manifest" }, null, 2));
  process.exit(0);
}
assert.ok(!fs.existsSync(destination), `pack already exists: ${manifest.pack.id}`);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`✓ created ${path.relative(process.cwd(), destination)}`);
