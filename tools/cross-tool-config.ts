import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export type CrossToolConfig = {
  schema: string;
  lantern: string;
  handbook: string;
};

export function readCrossToolConfig(source: string | undefined): CrossToolConfig {
  const root = process.cwd();
  const defaults = {
    schema: root,
    lantern: path.resolve(root, "..", "lantern"),
    handbook: path.resolve(root, "..", "handbook"),
  };
  if (!source) return defaults;
  const file = path.resolve(root, source);
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
  for (const key of ["schema", "lantern", "handbook"]) assert.equal(typeof raw[key], "string", `${key} must be a path`);
  return { schema: path.resolve(root, raw.schema as string), lantern: path.resolve(root, raw.lantern as string), handbook: path.resolve(root, raw.handbook as string) };
}
