import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GAMES } from "../src/zod/constants.js";
import { loadData } from "./read-data.js";

type Data = Record<string, unknown>;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handbookRoot = path.join(root, "handbook");
const errors: string[] = [];

function data(value: unknown): Data {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
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

for (const game of Object.values(GAMES).map(({ folder }) => folder).sort()) {
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
  if (!isDescriptor && /\.(toml|json)$/i.test(file)) errors.push(`Canonical-looking data is forbidden under handbook/: ${relative}`);
}

if (errors.length > 0) {
  console.error("\nHandbook pack validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\n✅ All Handbook packs and Lantern editor surfaces passed validation.");
}
