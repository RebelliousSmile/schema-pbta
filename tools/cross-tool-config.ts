import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export type CrossToolConfig = {
  providers: string[];
  lantern: string;
  handbook: string;
};

export function readCrossToolConfig(source: string | undefined): CrossToolConfig {
  const root = process.cwd();
  const defaults = {
    providers: [root, path.resolve(root, "..", "schema-in-the-mist"), path.resolve(root, "..", "schema-adrenaline")],
    lantern: path.resolve(root, "..", "lantern"),
    handbook: path.resolve(root, "..", "handbook"),
  };
  if (!source) return defaults;
  const file = path.resolve(root, source);
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
  assert.ok(Array.isArray(raw.providers) && raw.providers.every((value) => typeof value === "string"), "providers must be paths");
  for (const key of ["lantern", "handbook"]) assert.equal(typeof raw[key], "string", `${key} must be a path`);
  return { providers: raw.providers.map((value) => path.resolve(root, value)), lantern: path.resolve(root, raw.lantern as string), handbook: path.resolve(root, raw.handbook as string) };
}
