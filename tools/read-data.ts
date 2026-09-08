import fs from "node:fs";
import path from "node:path";
import TOML from "@iarna/toml";

/**
 * Reading data files, shared by the two validation passes.
 *
 * Both `validate-examples.ts` and `validate-references.ts` walk the same
 * corpus; the reading lives here so the second pass does not restate it.
 */

export function isJson(p: string) {
  return p.toLowerCase().endsWith(".json");
}

export function isToml(p: string) {
  return p.toLowerCase().endsWith(".toml");
}

export function isDataFile(p: string) {
  return isJson(p) || isToml(p);
}

export function loadData(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf8");
  if (isJson(filePath)) return JSON.parse(raw);
  if (isToml(filePath)) return TOML.parse(raw);
  throw new Error(`Unsupported file type: ${filePath}`);
}

/**
 * Files of one example directory.
 *
 * Flat on purpose: a file dropped in a subdirectory is not read, here as in the
 * first pass.
 */
export function listDataFiles(baseDir: string): string[] {
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir)
    .map((name) => path.join(baseDir, name))
    .filter((p) => fs.statSync(p).isFile())
    .filter(isDataFile);
}
