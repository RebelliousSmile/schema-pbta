import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { packManifestSchema } from "../src/pack-manifest.js";

const source = process.argv[2];
assert.ok(source, "usage: npm run validate:pack -- packs/<pack>/pack-contract.json");
const file = path.resolve(process.cwd(), source);
const root = path.resolve(process.cwd(), "corpus", "contract");
const manifest = packManifestSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
for (const document of manifest.documents) {
  const fixture = path.resolve(root, document.fixture);
  assert.ok(fixture.startsWith(`${root}${path.sep}`), `fixture escapes corpus: ${document.fixture}`);
  assert.ok(fs.statSync(fixture).isFile(), `missing fixture: ${document.fixture}`);
}
console.log(`✓ ${manifest.pack.id}: ${manifest.documents.length} documented targets`);
