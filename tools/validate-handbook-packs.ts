import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GAMES } from "../src/zod/constants.js";
import { loadData } from "./read-data.js";

type Data = Record<string, unknown>;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handbookRoot = path.join(root, "handbook");
const errors: string[] = [];
const expectedGames = Object.values(GAMES).map(({ folder }) => folder);
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const safeToken = /^--[A-Za-z0-9-]+$/;
const safeImageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const safeFontExtensions = new Set([".woff2", ".woff", ".ttf", ".otf"]);

const catalogueFields = ["manifestVersion", "repository", "name", "description", "author", "packs"];
const entryFields = ["id", "version", "path", "label", "description"];
const manifestFields = ["manifestVersion", "version", "minimumHandbookVersion", "requires", "variants", "defaultVariantId", "pack"];
const packFields = ["id", "label", "style", "polarities", "assets", "shapes"];
const styleFields = ["base", "light", "dark"];
const layerFields = ["note", "workspace"];
const assetFields = ["root", "images", "fonts"];
const variantFields = ["id", "label", "style", "polarities"];

function data(value: unknown): Data {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

function unknownFields(value: Data, allowed: string[]): string[] {
  return Object.keys(value).filter((field) => !allowed.includes(field));
}

function safeRelativePath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const clean = value.replaceAll("\\", "/");
  return clean.length > 0 && !clean.startsWith("/") && !/^[A-Za-z]:/.test(clean)
    && clean.split("/").every((part) => part.length > 0 && part !== "." && part !== "..");
}

function readJson(file: string, issues: string[], context: string): Data | null {
  try {
    return data(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch (error) {
    issues.push(`${context}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    return null;
  }
}

function validateTokens(value: unknown, issues: string[], context: string): void {
  const tokens = data(value);
  for (const [name, token] of Object.entries(tokens)) {
    if (!safeToken.test(name)) issues.push(`${context}: unsafe token name ${name}`);
    if (typeof token !== "string" || token.trim().length === 0 || /[{};<>]/.test(token)) {
      issues.push(`${context}: unsafe token value for ${name}`);
    }
  }
}

function validateStyle(value: unknown, issues: string[], context: string): void {
  const style = data(value);
  for (const field of unknownFields(style, styleFields)) issues.push(`${context}: unknown style field ${field}`);
  for (const layerName of styleFields) {
    if (style[layerName] === undefined) continue;
    const layer = data(style[layerName]);
    for (const field of unknownFields(layer, layerFields)) issues.push(`${context}.${layerName}: unknown layer field ${field}`);
    for (const slot of layerFields) {
      if (layer[slot] !== undefined) validateTokens(layer[slot], issues, `${context}.${layerName}.${slot}`);
    }
  }
}

/** Validate the exact closed payload that Handbook will resolve from one source. */
export function validateInstallableHandbookSource(sourceRoot: string): string[] {
  const issues: string[] = [];
  const catalogue = readJson(path.join(sourceRoot, "handbook.json"), issues, "handbook.json");
  if (!catalogue) return issues;
  for (const field of unknownFields(catalogue, catalogueFields)) issues.push(`handbook.json: unknown field ${field}`);
  if (catalogue.manifestVersion !== 1) issues.push("handbook.json: manifestVersion must be 1");
  if (catalogue.repository !== "RebelliousSmile/schema-pbta") issues.push("handbook.json: repository must be RebelliousSmile/schema-pbta");
  if (!Array.isArray(catalogue.packs)) {
    issues.push("handbook.json: packs must be an array");
    return issues;
  }

  const entries = catalogue.packs.map(data);
  const ids = entries.map((entry) => String(entry.id ?? ""));
  if (ids.join(",") !== expectedGames.join(",")) {
    issues.push(`handbook.json: expected packs in order ${expectedGames.join(", ")}`);
  }
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();

  for (const [index, entry] of entries.entries()) {
    const context = `handbook.json pack ${index + 1}`;
    for (const field of unknownFields(entry, entryFields)) issues.push(`${context}: unknown field ${field}`);
    const id = typeof entry.id === "string" ? entry.id : "";
    const version = typeof entry.version === "string" ? entry.version : "";
    const manifestPath = entry.path;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) issues.push(`${context}: invalid id`);
    if (!semver.test(version)) issues.push(`${context}: invalid version`);
    if (seenIds.has(id)) issues.push(`${context}: duplicate id ${id}`);
    seenIds.add(id);
    if (!safeRelativePath(manifestPath) || !manifestPath.endsWith("/pack.json")) {
      issues.push(`${context}: unsafe manifest path`);
      continue;
    }
    if (seenPaths.has(manifestPath)) issues.push(`${context}: duplicate path ${manifestPath}`);
    seenPaths.add(manifestPath);
    const manifest = readJson(path.join(sourceRoot, manifestPath), issues, `${id} manifest`);
    if (!manifest) continue;
    for (const field of unknownFields(manifest, manifestFields)) issues.push(`${id}: unknown manifest field ${field}`);
    if (manifest.manifestVersion !== 1) issues.push(`${id}: manifestVersion must be 1`);
    if (manifest.version !== version) issues.push(`${id}: manifest version does not match catalogue`);
    if (manifest.minimumHandbookVersion !== "2.7.1") issues.push(`${id}: minimumHandbookVersion must be 2.7.1`);
    if (!Array.isArray(manifest.requires) || manifest.requires.length !== 0) issues.push(`${id}: requires must stay empty until Handbook provides PbtA capabilities`);

    const pack = data(manifest.pack);
    for (const field of unknownFields(pack, packFields)) issues.push(`${id}: unknown pack field ${field}`);
    if (pack.id !== id) issues.push(`${id}: pack id does not match catalogue`);
    if (typeof pack.label !== "string" || pack.label.trim().length === 0) issues.push(`${id}: pack label is required`);
    validateStyle(pack.style, issues, `${id}.style`);
    const polarity = id === "the-sprawl" ? "dark" : "light";
    if (strings(pack.polarities).join(",") !== polarity) issues.push(`${id}: expected ${polarity} polarity`);
    const native = data(data(data(pack.style)[polarity]).note);
    for (const token of ["--background-primary", "--text-normal", "--color-accent"]) {
      if (typeof native[token] !== "string") issues.push(`${id}: missing native token ${token}`);
    }

    const manifestRoot = path.dirname(path.join(sourceRoot, manifestPath));
    const assets = data(pack.assets);
    for (const field of unknownFields(assets, assetFields)) issues.push(`${id}: unknown assets field ${field}`);
    const assetRoot = assets.root === undefined ? "assets" : assets.root;
    if (!safeRelativePath(assetRoot)) issues.push(`${id}: unsafe asset root`);
    for (const [family, declared] of Object.entries(data(assets.fonts))) {
      if (!family.trim() || /[{};<>\"]/.test(family)) {
        issues.push(`${id}: unsafe font family ${family}`);
        continue;
      }
      const face = typeof declared === "string" ? { file: declared } : data(declared);
      for (const field of unknownFields(face, ["file", "weight", "style"])) {
        issues.push(`${id}: unknown font field ${family}.${field}`);
      }
      const fontFile = face.file;
      if (!safeRelativePath(fontFile) || !safeFontExtensions.has(path.extname(fontFile).toLowerCase())) {
        issues.push(`${id}: unsafe or unsupported font ${family}`);
        continue;
      }
      for (const field of ["weight", "style"]) {
        const value = face[field];
        if (value !== undefined && (typeof value !== "string" || !value.trim() || /[{};<>]/.test(value))) {
          issues.push(`${id}: unsafe font ${field} for ${family}`);
        }
      }
      const fontAsset = path.join(manifestRoot, String(assetRoot), fontFile);
      if (!fs.existsSync(fontAsset)) issues.push(`${id}: missing font asset ${fontFile}`);
    }
    for (const [role, declared] of Object.entries(data(assets.images))) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(role) || !safeRelativePath(declared)) {
        issues.push(`${id}: unsafe image declaration ${role}`);
        continue;
      }
      const extension = path.extname(declared).toLowerCase();
      if (!safeImageExtensions.has(extension)) issues.push(`${id}: executable or unsupported asset ${declared}`);
      const asset = path.join(manifestRoot, String(assetRoot), declared);
      if (!fs.existsSync(asset)) issues.push(`${id}: missing asset ${declared}`);
    }

    if (manifest.variants !== undefined) {
      if (!Array.isArray(manifest.variants)) issues.push(`${id}: variants must be an array`);
      else for (const [variantIndex, rawVariant] of manifest.variants.entries()) {
        const variant = data(rawVariant);
        for (const field of unknownFields(variant, variantFields)) issues.push(`${id} variant ${variantIndex + 1}: unknown field ${field}`);
        if (typeof variant.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant.id)) issues.push(`${id} variant ${variantIndex + 1}: invalid id`);
        if (typeof variant.label !== "string" || variant.label.trim().length === 0) issues.push(`${id} variant ${variantIndex + 1}: label is required`);
        validateStyle(variant.style, issues, `${id}.variants.${String(variant.id)}`);
        if (strings(variant.polarities).length === 0) issues.push(`${id} variant ${variantIndex + 1}: polarity is required`);
      }
    }
    if (id === "monsterhearts") {
      const monsterheartsVariants = Array.isArray(manifest.variants) ? manifest.variants.map(data) : [];
      const monsterheartsBaseNote = data(data(data(pack.style).base).note);
      for (const token of [
        "--monsterhearts-table-ink",
        "--monsterhearts-table-background",
        "--monsterhearts-table-rule",
        "--monsterhearts-table-header",
        "--monsterhearts-table-header-ink",
      ]) {
        if (typeof monsterheartsBaseNote[token] !== "string") {
          issues.push(`monsterhearts: base theme must define ${token}`);
        }
      }
      const variantIds = monsterheartsVariants.map((variant) => String(variant.id ?? ""));
      if (manifest.defaultVariantId !== "base" || variantIds.join(",") !== "base,drowned-lake") {
        issues.push("monsterhearts: expected base then drowned-lake variants with base as default");
      }
      const variantPolarities = monsterheartsVariants.map((variant) => strings(variant.polarities).join(","));
      if (variantPolarities.join("|") !== "light|dark") {
        issues.push("monsterhearts: expected a light base variant and a dark drowned-lake variant");
      }
      const drownedLake = monsterheartsVariants.find((variant) => variant.id === "drowned-lake");
      const drownedLakeBaseNote = data(data(data(drownedLake?.style).base).note);
      for (const token of [
        "--text-normal",
        "--text-muted",
        "--text-faint",
        "--table-text-color",
        "--table-header-color",
        "--monsterhearts-table-ink",
        "--monsterhearts-table-background",
        "--monsterhearts-table-rule",
        "--monsterhearts-table-header",
        "--monsterhearts-table-header-ink",
      ]) {
        if (typeof drownedLakeBaseNote[token] !== "string") {
          issues.push(`monsterhearts: drowned-lake must pin readable ${token} at note scope`);
        }
      }
    } else if (manifest.variants !== undefined || manifest.defaultVariantId !== undefined) {
      issues.push(`${id}: only Monsterhearts declares variants`);
    }
  }
  return issues;
}

function requirePath(file: string, context: string): boolean {
  if (fs.existsSync(file)) return true;
  errors.push(`${context}: missing ${path.relative(root, file)}`);
  return false;
}

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

function validateLocalCssReferences(file: string, context: string): void {
  if (!fs.existsSync(file)) return;
  const css = fs.readFileSync(file, "utf8");
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    const reference = match[1].trim();
    if (/^(data:|https?:|#)/.test(reference)) continue;
    requirePath(path.resolve(path.dirname(file), reference), `${context} CSS reference`);
  }
}

function validateHtml(file: string, game: string): void {
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, "utf8");
  const regions = ["game-identity", "character-identity", "playbook-moves", "character-state", "mc-actions"];
  for (const region of regions) {
    if (!html.includes(`data-region="${region}"`)) errors.push(`${game}: generated preview misses region ${region}`);
  }
  for (const block of ["move", "stat", "attribute"]) {
    if (!html.includes(`data-schema-block="${block}"`)) errors.push(`${game}: generated preview misses schema block ${block}`);
  }
  if (!html.includes(`data-game="${game}"`)) errors.push(`${game}: generated preview has the wrong data-game`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (!reference || /^(data:|https?:|#)/.test(reference)) continue;
    requirePath(path.resolve(path.dirname(file), reference), `${game} HTML reference`);
  }
}

function validateEditorSurface(game: string, definition: Data, playbook: Data): void {
  const character = data(definition.character);
  const stats = data(character.stats);
  const attributes = data(character.attributes);
  const moveTypes = data(character.moveTypes);
  if (Object.keys(stats).length === 0) errors.push(`${game}: Lantern surface has no character stats`);
  if (Object.keys(attributes).length === 0) errors.push(`${game}: Lantern surface has no typed attributes`);
  if (Object.keys(moveTypes).length === 0) errors.push(`${game}: Lantern surface has no character move types`);
  for (const [key, attribute] of Object.entries(attributes)) {
    if (typeof data(attribute).type !== "string") errors.push(`${game}: attribute ${key} has no form discriminator`);
  }
  if (Object.keys(data(playbook.stats)).length === 0) errors.push(`${game}: preview playbook has no structured stat values`);
  if (Object.keys(data(playbook.attributes)).length === 0) errors.push(`${game}: preview playbook has no structured attribute values`);
  if (!Array.isArray(playbook.moves) || playbook.moves.length === 0) errors.push(`${game}: preview playbook has no structured moves`);
}

errors.push(...validateInstallableHandbookSource(root));

for (const game of [...expectedGames].sort()) {
  const pack = path.join(handbookRoot, game);
  const context = `handbook/${game}`;
  requirePath(path.join(pack, "README.md"), context);
  const baseCss = path.join(pack, "styles", "base.css");
  requirePath(baseCss, context);
  requirePath(path.join(pack, "styles", "variants"), context);
  requirePath(path.join(pack, "assets", "fonts"), context);
  const imageDirectory = path.join(pack, "assets", "images");
  requirePath(imageDirectory, context);
  requirePath(path.join(pack, "assets", "variants"), context);
  if (walk(imageDirectory).length === 0) errors.push(`${context}: assets/images is empty`);
  validateLocalCssReferences(baseCss, context);

  const descriptorFile = path.join(pack, "preview", "preview.toml");
  const htmlFile = path.join(pack, "preview", "index.html");
  if (!requirePath(descriptorFile, context) || !requirePath(htmlFile, context)) continue;
  const descriptor = data(loadData(descriptorFile));
  if (descriptor.game !== game) errors.push(`${context}: descriptor game must be ${game}`);
  const variants = strings(descriptor.variants);
  if (!variants.includes("base")) errors.push(`${context}: variants must include base`);
  if (!variants.includes(String(descriptor.defaultVariant))) errors.push(`${context}: defaultVariant is not declared`);

  const references: Array<[string, string]> = [
    ["game-definition", String(descriptor.gameDefinition)],
    ["playbook", String(descriptor.playbook)],
    ...strings(descriptor.moves).map((slug): [string, string] => ["move", slug]),
    ...strings(descriptor.mcMoves).map((slug): [string, string] => ["move", slug]),
  ];
  for (const [kind, slug] of references) {
    requirePath(path.join(root, "examples", game, kind, `${slug}.toml`), `${context} descriptor reference`);
  }

  for (const variant of variants.filter((name) => name !== "base")) {
    const variantCss = path.join(pack, "styles", "variants", `${variant}.css`);
    requirePath(variantCss, `${context} variant ${variant}`);
    requirePath(path.join(pack, "assets", "variants", variant), `${context} variant ${variant}`);
    validateLocalCssReferences(variantCss, `${context} variant ${variant}`);
  }

  const definitionFile = path.join(root, "examples", game, "game-definition", `${descriptor.gameDefinition}.toml`);
  const playbookFile = path.join(root, "examples", game, "playbook", `${descriptor.playbook}.toml`);
  if (fs.existsSync(definitionFile) && fs.existsSync(playbookFile)) {
    validateEditorSurface(game, data(loadData(definitionFile)), data(loadData(playbookFile)));
  }
  validateHtml(htmlFile, game);
  console.log(`✓ ${context}`);
}

for (const file of walk(handbookRoot)) {
  const relative = path.relative(handbookRoot, file).replaceAll("\\", "/");
  const isDescriptor = /\/preview\/preview\.toml$/.test(`/${relative}`);
  const isPackManifest = /\/pack\.json$/.test(`/${relative}`);
  if (!isDescriptor && !isPackManifest && /\.(toml|json)$/i.test(file)) errors.push(`Canonical-looking data is forbidden under handbook/: ${relative}`);
}

if (errors.length > 0) {
  console.error("\nHandbook pack validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\n✅ All Handbook packs and Lantern editor surfaces passed validation.");
}
