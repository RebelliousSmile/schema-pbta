import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GAMES } from "../src/zod/constants.js";
import { loadData } from "./read-data.js";

type Data = Record<string, unknown>;
export type HandbookBundle = {
  catalogue: unknown;
  manifests: Record<string, unknown>;
  files: Set<string>;
};
export type PreparedHandbookBundle = { errors: string[]; payload: string[] };

const CATALOGUE_FIELDS = ["manifestVersion", "repository", "name", "description", "author", "packs"];
const ENTRY_FIELDS = ["id", "version", "path", "label", "description"];
const MANIFEST_FIELDS = ["manifestVersion", "version", "minimumHandbookVersion", "requires", "variants", "defaultVariantId", "pack"];
const PACK_FIELDS = ["id", "label", "style", "polarities", "assets", "shapes"];
const VARIANT_FIELDS = ["id", "label", "style", "polarities"];
const STYLE_FIELDS = ["base", "light", "dark"];
const LAYER_FIELDS = ["note", "workspace"];
const ASSET_FIELDS = ["root", "images", "fonts"];
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN = /^--[a-zA-Z0-9-]+$/;
const IMAGE = /\.(?:png|jpe?g|webp|gif|svg)$/i;
const FORBIDDEN_VALUE = /["{};<>]/;
const MAX_PACKS = 64;
const MAX_ASSETS = 256;
const MAX_ASSET_BYTES = 20 * 1024 * 1024;

function data(value: unknown): Data | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Data : null;
}

function unknownFields(value: Data, allowed: string[], context: string, errors: string[]): void {
  const unknown = Object.keys(value).filter((field) => !allowed.includes(field));
  if (unknown.length) errors.push(`${context}: unknown fields ${unknown.join(", ")}`);
}

function safePath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.includes("\\")) return false;
  if (value.startsWith("/") || /^[a-z]+:/i.test(value)) return false;
  return value.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

function versionParts(value: string): number[] {
  return value.split(".").map(Number);
}

function versionAtLeast(value: string, minimum: string): boolean {
  const left = versionParts(value);
  const right = versionParts(minimum);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] > right[i];
  }
  return true;
}

function validateTokens(value: unknown, context: string, errors: string[]): void {
  const style = data(value);
  if (!style) { errors.push(`${context}: style must be an object`); return; }
  unknownFields(style, STYLE_FIELDS, context, errors);
  for (const polarity of STYLE_FIELDS) {
    if (style[polarity] === undefined) continue;
    const layer = data(style[polarity]);
    if (!layer) { errors.push(`${context}.${polarity}: layer must be an object`); continue; }
    unknownFields(layer, LAYER_FIELDS, `${context}.${polarity}`, errors);
    for (const slot of LAYER_FIELDS) {
      if (layer[slot] === undefined) continue;
      const tokens = data(layer[slot]);
      if (!tokens) { errors.push(`${context}.${polarity}.${slot}: tokens must be an object`); continue; }
      for (const [name, tokenValue] of Object.entries(tokens)) {
        if (!TOKEN.test(name)) errors.push(`${context}.${polarity}.${slot}.${name}: unsafe token name`);
        if (typeof tokenValue !== "string" || FORBIDDEN_VALUE.test(tokenValue)) errors.push(`${context}.${polarity}.${slot}.${name}: unsafe token value`);
      }
    }
  }
}

function validatePolarities(value: unknown, context: string, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0 || value.some((entry) => entry !== "light" && entry !== "dark") || new Set(value).size !== value.length) {
    errors.push(`${context}: polarities must be a non-empty unique light/dark list`);
  }
}

function validatePack(packValue: unknown, context: string, root: string, files: Set<string>, errors: string[], assetPayload: string[]): void {
  const pack = data(packValue);
  if (!pack) { errors.push(`${context}: pack must be an object`); return; }
  unknownFields(pack, PACK_FIELDS, context, errors);
  if (typeof pack.id !== "string" || !ID.test(pack.id)) errors.push(`${context}.id: invalid id`);
  if (typeof pack.label !== "string" || !pack.label.trim()) errors.push(`${context}.label: missing label`);
  validatePolarities(pack.polarities, `${context}.polarities`, errors);
  validateTokens(pack.style, `${context}.style`, errors);

  const assets = data(pack.assets);
  if (!assets) return;
  unknownFields(assets, ASSET_FIELDS, `${context}.assets`, errors);
  if (assets.fonts !== undefined) errors.push(`${context}.assets.fonts: fonts are not distributed by this source`);
  const assetRoot = assets.root === undefined ? "assets" : assets.root;
  if (!safePath(assetRoot)) { errors.push(`${context}.assets.root: unsafe path`); return; }
  const images = data(assets.images);
  if (!images) { errors.push(`${context}.assets.images: images must be an object`); return; }
  for (const [role, fileValue] of Object.entries(images)) {
    if (!ID.test(role)) errors.push(`${context}.assets.images.${role}: invalid role`);
    if (!safePath(fileValue) || !IMAGE.test(fileValue)) { errors.push(`${context}.assets.images.${role}: unsafe or unsupported image path`); continue; }
    const relative = `${root}/${assetRoot}/${fileValue}`;
    if (!files.has(relative)) errors.push(`${context}.assets.images.${role}: missing ${relative}`);
    else assetPayload.push(relative);
  }
}

export function prepareHandbookBundle(bundle: HandbookBundle, handbookVersion = "2.7.1"): PreparedHandbookBundle {
  const errors: string[] = [];
  const payload: string[] = [];
  const catalogue = data(bundle.catalogue);
  if (!catalogue) return { errors: ["handbook.json: catalogue must be an object"], payload: [] };
  unknownFields(catalogue, CATALOGUE_FIELDS, "handbook.json", errors);
  if (catalogue.manifestVersion !== 1) errors.push("handbook.json.manifestVersion: only version 1 is supported");
  if (catalogue.repository !== "RebelliousSmile/schema-pbta") errors.push("handbook.json.repository: unexpected repository");
  const entries = Array.isArray(catalogue.packs) ? catalogue.packs : [];
  if (!Array.isArray(catalogue.packs) || entries.length === 0 || entries.length > MAX_PACKS) errors.push("handbook.json.packs: invalid pack count");
  const expected = Object.values(GAMES).map((game) => game.folder);
  const ids: string[] = [];
  const paths: string[] = [];
  const assets: string[] = [];

  entries.forEach((entryValue, index) => {
    const context = `handbook.json.packs[${index}]`;
    const entry = data(entryValue);
    if (!entry) { errors.push(`${context}: entry must be an object`); return; }
    unknownFields(entry, ENTRY_FIELDS, context, errors);
    const id = typeof entry.id === "string" ? entry.id : "";
    const manifestPath = entry.path;
    if (!ID.test(id)) errors.push(`${context}.id: invalid id`);
    if (ids.includes(id)) errors.push(`${context}.id: duplicate ${id}`);
    ids.push(id);
    if (typeof entry.version !== "string" || !SEMVER.test(entry.version)) errors.push(`${context}.version: invalid SemVer`);
    if (!safePath(manifestPath) || !manifestPath.endsWith("/pack.json")) { errors.push(`${context}.path: unsafe manifest path`); return; }
    if (paths.includes(manifestPath)) errors.push(`${context}.path: duplicate ${manifestPath}`);
    paths.push(manifestPath);
    const manifest = data(bundle.manifests[manifestPath]);
    if (!manifest) { errors.push(`${manifestPath}: missing manifest`); return; }
    unknownFields(manifest, MANIFEST_FIELDS, manifestPath, errors);
    if (manifest.manifestVersion !== 1) errors.push(`${manifestPath}.manifestVersion: only version 1 is supported`);
    if (manifest.version !== entry.version) errors.push(`${manifestPath}.version: does not match catalogue`);
    if (manifest.minimumHandbookVersion !== "2.7.1") errors.push(`${manifestPath}.minimumHandbookVersion: expected 2.7.1`);
    if (typeof manifest.minimumHandbookVersion === "string" && SEMVER.test(manifest.minimumHandbookVersion) && !versionAtLeast(handbookVersion, manifest.minimumHandbookVersion)) errors.push(`${manifestPath}: requires Handbook ${manifest.minimumHandbookVersion} or newer`);
    if (!Array.isArray(manifest.requires) || manifest.requires.length !== 0) errors.push(`${manifestPath}.requires: PbtA capabilities are not available in Handbook 2.7.1`);
    const pack = data(manifest.pack);
    if (pack?.id !== id) errors.push(`${manifestPath}.pack.id: does not match catalogue id ${id}`);
    validatePack(pack, `${manifestPath}.pack`, manifestPath.slice(0, manifestPath.lastIndexOf("/")), bundle.files, errors, assets);

    const variants = manifest.variants;
    if (variants !== undefined) {
      if (!Array.isArray(variants)) errors.push(`${manifestPath}.variants: variants must be an array`);
      else {
        const variantIds: string[] = [];
        variants.forEach((variantValue, variantIndex) => {
          const variantContext = `${manifestPath}.variants[${variantIndex}]`;
          const variant = data(variantValue);
          if (!variant) { errors.push(`${variantContext}: variant must be an object`); return; }
          unknownFields(variant, VARIANT_FIELDS, variantContext, errors);
          if (typeof variant.id !== "string" || !ID.test(variant.id) || variantIds.includes(variant.id)) errors.push(`${variantContext}.id: invalid or duplicate id`);
          else variantIds.push(variant.id);
          if (typeof variant.label !== "string" || !variant.label.trim()) errors.push(`${variantContext}.label: missing label`);
          validatePolarities(variant.polarities, `${variantContext}.polarities`, errors);
          validateTokens(variant.style, `${variantContext}.style`, errors);
        });
        if (typeof manifest.defaultVariantId !== "string" || !variantIds.includes(manifest.defaultVariantId)) errors.push(`${manifestPath}.defaultVariantId: does not name a variant`);
      }
    } else if (manifest.defaultVariantId !== undefined) errors.push(`${manifestPath}.defaultVariantId: variants are absent`);
  });

  if (JSON.stringify(ids) !== JSON.stringify(expected)) errors.push(`handbook.json.packs: expected ids in order ${expected.join(", ")}`);
  if (assets.length > MAX_ASSETS) errors.push(`payload: more than ${MAX_ASSETS} assets`);
  const bytes = assets.reduce((total, file) => total + (bundle.files.has(file) ? 1 : 0), 0);
  if (bytes > MAX_ASSET_BYTES) errors.push(`payload: exceeds ${MAX_ASSET_BYTES} bytes`);
  if (errors.length) return { errors, payload: [] };
  payload.push("handbook.json", ...paths, ...assets);
  return { errors: [], payload };
}

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

export function readHandbookBundle(root: string): HandbookBundle {
  const cataloguePath = path.join(root, "handbook.json");
  const catalogue = JSON.parse(fs.readFileSync(cataloguePath, "utf8")) as Data;
  const manifests: Record<string, unknown> = {};
  for (const entry of Array.isArray(catalogue.packs) ? catalogue.packs : []) {
    const manifestPath = data(entry)?.path;
    if (typeof manifestPath === "string" && fs.existsSync(path.join(root, manifestPath))) {
      manifests[manifestPath] = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
    }
  }
  return {
    catalogue,
    manifests,
    files: new Set(walk(path.join(root, "handbook")).map((file) => path.relative(root, file).replaceAll("\\", "/"))),
  };
}

function validatePreviews(root: string, errors: string[]): void {
  const handbookRoot = path.join(root, "handbook");
  for (const game of Object.values(GAMES).map(({ folder }) => folder)) {
    const descriptorPath = path.join(handbookRoot, game, "preview", "preview.toml");
    const htmlPath = path.join(handbookRoot, game, "preview", "index.html");
    if (!fs.existsSync(descriptorPath) || !fs.existsSync(htmlPath)) { errors.push(`${game}: missing preview`); continue; }
    const descriptor = data(loadData(descriptorPath));
    const html = fs.readFileSync(htmlPath, "utf8");
    if (descriptor?.game !== game) errors.push(`${game}: preview descriptor mismatch`);
    for (const region of ["game-identity", "character-identity", "playbook-moves", "character-state", "mc-actions"]) {
      if (!html.includes(`data-region="${region}"`)) errors.push(`${game}: generated preview misses region ${region}`);
    }
  }
}

export function validateRepository(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")): PreparedHandbookBundle {
  const result = prepareHandbookBundle(readHandbookBundle(root));
  const errors = [...result.errors];
  validatePreviews(root, errors);
  return errors.length ? { errors, payload: [] } : result;
}

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invoked === fileURLToPath(import.meta.url)) {
  const result = validateRepository();
  if (result.errors.length) {
    console.error("Handbook pack validation failed:");
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(`✅ Handbook catalogue prepared ${result.payload.length} files from five packs.`);
  }
}
