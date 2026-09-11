import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateInstallableHandbookSource } from "./validate-handbook-packs.js";

type Data = Record<string, any>;

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(file: string): Data {
  return JSON.parse(fs.readFileSync(file, "utf8")) as Data;
}

function writeJson(file: string, value: Data): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function fixture(label: string, mutate: (root: string) => void, expected: string): void {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "schema-pbta-handbook-"));
  try {
    fs.copyFileSync(path.join(projectRoot, "handbook.json"), path.join(temporary, "handbook.json"));
    fs.cpSync(path.join(projectRoot, "handbook"), path.join(temporary, "handbook"), { recursive: true });
    mutate(temporary);
    const issues = validateInstallableHandbookSource(temporary);
    if (!issues.some((issue) => issue.includes(expected))) {
      throw new Error(`${label}: expected ${expected}, received ${issues.join(" | ") || "no issue"}`);
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

const baseline = validateInstallableHandbookSource(projectRoot);
if (baseline.length > 0) throw new Error(`valid catalogue was rejected: ${baseline.join(" | ")}`);

fixture("catalogue version", (root) => {
  const catalogue = readJson(path.join(root, "handbook.json"));
  catalogue.manifestVersion = 2;
  writeJson(path.join(root, "handbook.json"), catalogue);
}, "manifestVersion");

fixture("duplicate id", (root) => {
  const catalogue = readJson(path.join(root, "handbook.json"));
  catalogue.packs[4].id = catalogue.packs[0].id;
  writeJson(path.join(root, "handbook.json"), catalogue);
}, "duplicate id");

fixture("unsafe manifest path", (root) => {
  const catalogue = readJson(path.join(root, "handbook.json"));
  catalogue.packs[0].path = "../pack.json";
  writeJson(path.join(root, "handbook.json"), catalogue);
}, "unsafe manifest path");

fixture("catalogue mismatch", (root) => {
  const manifest = readJson(path.join(root, "handbook", "the-sprawl", "pack.json"));
  manifest.version = "0.2.1";
  writeJson(path.join(root, "handbook", "the-sprawl", "pack.json"), manifest);
}, "manifest version does not match catalogue");

fixture("unknown field", (root) => {
  const manifest = readJson(path.join(root, "handbook", "masks", "pack.json"));
  manifest.script = "install.js";
  writeJson(path.join(root, "handbook", "masks", "pack.json"), manifest);
}, "unknown manifest field script");

fixture("old minimum", (root) => {
  const manifest = readJson(path.join(root, "handbook", "masks", "pack.json"));
  manifest.minimumHandbookVersion = "2.7.3";
  writeJson(path.join(root, "handbook", "masks", "pack.json"), manifest);
}, "minimumHandbookVersion");

fixture("missing capability", (root) => {
  const manifest = readJson(path.join(root, "handbook", "masks", "pack.json"));
  manifest.requires = ["style:pbta"];
  writeJson(path.join(root, "handbook", "masks", "pack.json"), manifest);
}, "requires must equal");

fixture("unknown capability", (root) => {
  const manifest = readJson(path.join(root, "handbook", "masks", "pack.json"));
  manifest.requires = ["block:pbta-playbook", "block:pbta-move", "style:pbta", "block:not-installed"];
  writeJson(path.join(root, "handbook", "masks", "pack.json"), manifest);
}, "requires must equal");

fixture("unsafe token", (root) => {
  const manifest = readJson(path.join(root, "handbook", "masks", "pack.json"));
  manifest.pack.style.light.note["color};body{--owned"] = "red";
  writeJson(path.join(root, "handbook", "masks", "pack.json"), manifest);
}, "unsafe token name");

fixture("missing asset", (root) => {
  const manifest = readJson(path.join(root, "handbook", "masks", "pack.json"));
  manifest.pack.assets.images["game-mark"] = "images/missing.svg";
  writeJson(path.join(root, "handbook", "masks", "pack.json"), manifest);
}, "missing asset");

fixture("executable asset", (root) => {
  const manifest = readJson(path.join(root, "handbook", "masks", "pack.json"));
  manifest.pack.assets.images["game-mark"] = "images/install.js";
  writeJson(path.join(root, "handbook", "masks", "pack.json"), manifest);
}, "executable or unsupported asset");

console.log("✅ Handbook catalogue rejection fixtures passed validation.");
