import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import IarnaToml from "@iarna/toml";
import { parse as parseSmolToml } from "smol-toml";
import { ZodError } from "zod";
import {
  parsePlaybookToml,
  stringifyPlaybookToml,
} from "../src/codecs/toml.js";

const root = process.cwd();
const contractRoot = path.join(root, "corpus", "contract");

function files(directory: string): string[] {
  return fs.readdirSync(directory).sort().map((name) => path.join(directory, name));
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, normalize(child)]),
    );
  }
  return value;
}

for (const file of files(path.join(contractRoot, "valid"))) {
  const source = fs.readFileSync(file, "utf8");
  const canonical = parsePlaybookToml(source);
  const reparsed = parsePlaybookToml(stringifyPlaybookToml(canonical));
  assert.deepEqual(normalize(reparsed), normalize(canonical), `${file}: canonical round-trip changed the document`);
  assert.deepEqual(
    normalize(parseSmolToml(source)),
    normalize(IarnaToml.parse(source)),
    `${file}: supported TOML parsers disagree`,
  );
  console.log(`✓ contract witness: ${path.relative(root, file)}`);
}

for (const file of files(path.join(contractRoot, "invalid"))) {
  const source = fs.readFileSync(file, "utf8");
  assert.throws(() => parsePlaybookToml(source), ZodError, `${file}: invalid fixture was accepted`);
  console.log(`✓ contract rejection: ${path.relative(root, file)}`);
}

console.log("\n✅ Canonical PbtA TOML contract passed semantic round-trip validation.");
