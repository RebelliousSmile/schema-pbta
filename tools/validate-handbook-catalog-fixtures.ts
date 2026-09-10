import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  HandbookBundle,
  prepareHandbookBundle,
  readHandbookBundle,
} from "./validate-handbook-packs.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readHandbookBundle(root);

function clone(): HandbookBundle {
  return structuredClone(source);
}

function catalogue(bundle: HandbookBundle): Record<string, unknown> {
  return bundle.catalogue as Record<string, unknown>;
}

function entries(bundle: HandbookBundle): Array<Record<string, unknown>> {
  return catalogue(bundle).packs as Array<Record<string, unknown>>;
}

function manifest(bundle: HandbookBundle, game: string): Record<string, unknown> {
  return bundle.manifests[`handbook/${game}/pack.json`] as Record<string, unknown>;
}

function pack(bundle: HandbookBundle, game: string): Record<string, unknown> {
  return manifest(bundle, game).pack as Record<string, unknown>;
}

function expectFailure(name: string, mutate: (bundle: HandbookBundle) => void, expected: string, handbookVersion = "2.7.1"): void {
  const bundle = clone();
  mutate(bundle);
  const result = prepareHandbookBundle(bundle, handbookVersion);
  assert.equal(result.payload.length, 0, `${name}: invalid source must return no partial payload`);
  assert.ok(result.errors.some((error) => error.includes(expected)), `${name}: expected diagnostic containing "${expected}", got ${result.errors.join(" | ")}`);
}

const valid = prepareHandbookBundle(source);
assert.deepEqual(valid.errors, []);
assert.equal(valid.payload.length, 12);

expectFailure("manifest version", (bundle) => { manifest(bundle, "masks").manifestVersion = 2; }, "only version 1");
expectFailure("duplicate id", (bundle) => { entries(bundle)[1].id = "masks"; }, "duplicate masks");
expectFailure("catalogue mismatch", (bundle) => { manifest(bundle, "masks").version = "0.1.1"; }, "does not match catalogue");
expectFailure("unknown field", (bundle) => { manifest(bundle, "masks").script = "run.js"; }, "unknown fields script");
expectFailure("old host", () => {}, "requires Handbook 2.7.1", "2.7.0");
expectFailure("capability", (bundle) => { manifest(bundle, "masks").requires = ["block:pbta-playbook"]; }, "capabilities are not available");
expectFailure("token name", (bundle) => {
  const style = pack(bundle, "masks").style as Record<string, Record<string, Record<string, unknown>>>;
  style.light.note["color:red"] = "red";
}, "unsafe token name");
expectFailure("token value", (bundle) => {
  const style = pack(bundle, "masks").style as Record<string, Record<string, Record<string, unknown>>>;
  style.light.note["--text-normal"] = "red;display:none";
}, "unsafe token value");
expectFailure("asset absent", (bundle) => { bundle.files.delete("handbook/masks/assets/images/hero-burst.svg"); }, "missing handbook/masks/assets/images/hero-burst.svg");
expectFailure("manifest traversal", (bundle) => { entries(bundle)[0].path = "../pack.json"; }, "unsafe manifest path");
expectFailure("executable asset", (bundle) => {
  const assets = pack(bundle, "masks").assets as Record<string, Record<string, string>>;
  assets.images["hero-burst"] = "images/run.js";
  bundle.files.add("handbook/masks/assets/images/run.js");
}, "unsafe or unsupported image path");
expectFailure("late fifth pack", (bundle) => { manifest(bundle, "the-sprawl").version = "broken"; }, "handbook/the-sprawl/pack.json.version");

console.log("✅ Handbook catalogue rejection and all-or-nothing fixtures passed.");
