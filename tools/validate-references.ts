import path from "node:path";
import { GAMES, TARGETS } from "../src/zod/constants";
import { listDataFiles, loadData } from "./read-data";

/**
 * Second validation pass: what JSON Schema cannot see.
 *
 * Ajv checks one file against one schema. It cannot check that a stat key of a
 * playbook exists in the game it claims, that a `ref` points at a file that is
 * really there, or that two fields agree with each other. Those checks live
 * here, and read the corpus rather than the schemas.
 *
 * Errors exit 1. Warnings do not: a move naming a result outside the game's
 * tiers is legitimate, an unresolved reference is not.
 */

type Severity = "error" | "warning";
type Diagnostic = {
  file: string;
  key: string;
  message: string;
  severity: Severity;
};

const diagnostics: Diagnostic[] = [];

function report(severity: Severity, file: string, key: string, message: string) {
  diagnostics.push({ file, key, message, severity });
}
const error = (file: string, key: string, message: string) =>
  report("error", file, key, message);
const warn = (file: string, key: string, message: string) =>
  report("warning", file, key, message);

type Dict = Record<string, unknown>;
type ContentFile = { file: string; type: string; data: Dict };
type Game = { name: string; folder: string; abbr: string };

function isDict(v: unknown): v is Dict {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function keysOf(v: unknown): string[] {
  return isDict(v) ? Object.keys(v) : [];
}

/** Every plain object of a document, with the key path that leads to it. */
function* walk(node: unknown, keyPath: string): Generator<[Dict, string]> {
  if (Array.isArray(node)) {
    for (const [i, item] of node.entries()) {
      yield* walk(item, `${keyPath}[${i}]`);
    }
    return;
  }
  if (!isDict(node)) return;
  yield [node, keyPath];
  for (const [k, v] of Object.entries(node)) {
    yield* walk(v, keyPath === "" ? k : `${keyPath}.${k}`);
  }
}

function at(keyPath: string): string {
  return keyPath === "" ? "" : `${keyPath}.`;
}

function list(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "(none declared)";
}

/**
 * Every reference a document carries, with the content type it points at.
 *
 * Collected by shape rather than field by field: a `ref` under `cast` names an
 * NPC, a `playbook` field names a playbook, every other `ref` names a move.
 */
function collectReferences(
  data: Dict
): Array<{ key: string; slug: string; type: string }> {
  const references: Array<{ key: string; slug: string; type: string }> = [];
  for (const [node, keyPath] of walk(data, "")) {
    const prefix = at(keyPath);
    if (typeof node.ref === "string") {
      references.push({
        key: `${prefix}ref`,
        slug: node.ref,
        type: /(^|\.)cast\[/.test(prefix) ? "npc" : "move",
      });
    }
    // Gated on a move-like host: `playbook` on a move names a playbook, but a
    // key that merely happens to be called `playbook` — a `moveTypes` entry of
    // a game definition, say — names nothing.
    if (typeof node.playbook === "string" && typeof node.moveType === "string") {
      references.push({
        key: `${prefix}playbook`,
        slug: node.playbook,
        type: "playbook",
      });
    }
    if (Array.isArray(node.startingMoves)) {
      for (const [i, slug] of node.startingMoves.entries()) {
        if (typeof slug !== "string") continue;
        references.push({
          key: `${prefix}startingMoves[${i}]`,
          slug,
          type: "move",
        });
      }
    }
  }
  return references;
}

/**
 * Anything that behaves like a move: a move file, or a move written inline in a
 * playbook, an NPC or a front. Collected by shape rather than by location, so
 * that a new host document needs no change here.
 */
function moveLikeObjects(data: Dict): Array<[Dict, string]> {
  return [...walk(data, "")].filter(
    ([node]) => typeof node.moveType === "string"
  );
}

function checkGame(game: Game) {
  const definitionDir = path.join("examples", game.folder, "game-definition");
  const definitionFiles = listDataFiles(definitionDir);

  if (definitionFiles.length === 0) {
    const expected = path.join(definitionDir, `${game.folder}.toml`);
    console.warn(
      `⚠️  No game definition for ${game.folder}: expected ${expected} (skipping the game)`
    );
    return;
  }

  if (definitionFiles.length > 1) {
    error(
      definitionDir,
      "game-definition",
      `${definitionFiles.length} game definitions found (${definitionFiles.join(
        ", "
      )}); exactly one is expected, named after the game folder. Two competing definitions make every other rule undecidable.`
    );
    return;
  }

  const definitionFile = definitionFiles[0];
  const expectedName = `${game.folder}${path.extname(definitionFile)}`;
  if (path.basename(definitionFile) !== expectedName) {
    error(
      definitionFile,
      "game-definition",
      `the game definition must be named after the game folder: expected ${expectedName}`
    );
  }

  const definitionData = loadData(definitionFile);
  if (!isDict(definitionData)) {
    error(definitionFile, "(root)", "the game definition is not an object");
    return;
  }
  const definition = definitionData;
  const character = isDict(definition.character) ? definition.character : {};
  const npc = isDict(definition.npc) ? definition.npc : {};

  const statKeys = keysOf(character.stats);
  const attributeKeys: Record<string, string[]> = {
    playbook: keysOf(character.attributes),
    npc: keysOf(npc.attributes),
  };
  // Character side and NPC side pooled, deduplicated: the two blocks routinely
  // declare the same key, and a message listing it twice reads as a bug.
  const moveTypes = [
    ...new Set([...keysOf(character.moveTypes), ...keysOf(npc.moveTypes)]),
  ];
  const equipmentTypes = [
    ...new Set([
      ...keysOf(character.equipmentTypes),
      ...keysOf(npc.equipmentTypes),
    ]),
  ];
  const rollResults = keysOf(definition.rollResults);
  const fronts = isDict(definition.fronts) ? definition.fronts : {};
  const threatTypes = keysOf(fronts.threatTypes);
  const impulses = keysOf(fronts.impulses);
  // `clockPresets` is a list, not a dictionary: a preset carries its own `key`
  // alongside a label and its ordered segments. Indexed here by that key, with
  // the number of segments a clock inherits when it names the preset.
  const clockSegments = new Map<string, number>();
  const presetList = Array.isArray(fronts.clockPresets) ? fronts.clockPresets : [];
  for (const preset of presetList) {
    if (!isDict(preset)) continue;
    if (typeof preset.key !== "string") continue;
    clockSegments.set(
      preset.key,
      Array.isArray(preset.segments) ? preset.segments.length : 0
    );
  }

  // Content of the game, by target name. The definition is loaded above.
  const contents: ContentFile[] = [];
  for (const target of TARGETS) {
    if (target.game.folder !== game.folder) continue;
    if (target.name === "game-definition") continue;
    const dir = path.join("examples", game.folder, target.name);
    for (const file of listDataFiles(dir)) {
      const data = loadData(file);
      if (!isDict(data)) {
        error(file, "(root)", "the document is not an object");
        continue;
      }
      contents.push({ file, type: target.name, data });
    }
  }

  // Rule 5: slugs are unique per game and per content type. Only content files
  // count: an inline move has no `slug`, so it enters neither this rule nor the
  // reference rule.
  const slugsByType = new Map<string, Map<string, string>>();
  for (const content of contents) {
    const slug = content.data.slug;
    if (typeof slug !== "string") continue;
    const seen = slugsByType.get(content.type) ?? new Map<string, string>();
    const previous = seen.get(slug);
    if (previous !== undefined) {
      error(
        content.file,
        "slug",
        `duplicate ${content.type} slug "${slug}", already carried by ${previous}`
      );
    } else {
      seen.set(slug, content.file);
    }
    slugsByType.set(content.type, seen);
  }

  const knownFolders = Object.values(GAMES).map((g) => g.folder);
  const documents: ContentFile[] = [
    ...contents,
    { file: definitionFile, type: "game-definition", data: definition },
  ];

  for (const { file, type, data } of documents) {
    // Rule 6: `game` names a folder of GAMES, and that folder is the one the
    // file sits in. Compared against `folder` and never against the dictionary
    // key: the two differ as soon as an entry carries an abbreviation.
    if (typeof data.game !== "string") {
      error(file, "game", "missing `game` field");
    } else if (!knownFolders.includes(data.game)) {
      error(
        file,
        "game",
        `unknown game "${data.game}"; expected one of: ${list(knownFolders)}`
      );
    } else if (data.game !== game.folder) {
      error(
        file,
        "game",
        `game "${data.game}" does not match the folder the file lives in ("${game.folder}")`
      );
    }

    // Rule 1: stat and attribute keys exist in the game definition.
    if (type === "playbook") {
      for (const key of keysOf(data.stats)) {
        if (statKeys.includes(key)) continue;
        error(
          file,
          `stats.${key}`,
          `unknown stat "${key}"; the game declares: ${list(statKeys)}`
        );
      }
    }
    const declaredAttributes = attributeKeys[type];
    if (declaredAttributes !== undefined) {
      for (const key of keysOf(data.attributes)) {
        if (declaredAttributes.includes(key)) continue;
        error(
          file,
          `attributes.${key}`,
          `unknown attribute "${key}"; the game declares for ${type}: ${list(
            declaredAttributes
          )}`
        );
      }
    }

    // Rules 2, 7 and 8 walk into inline moves too.
    for (const [move, keyPath] of moveLikeObjects(data)) {
      const prefix = at(keyPath);
      const moveType = move.moveType as string;
      if (!moveTypes.includes(moveType)) {
        error(
          file,
          `${prefix}moveType`,
          `unknown move type "${moveType}"; the game declares: ${list(
            moveTypes
          )}`
        );
      }
      const resultKeys = keysOf(move.results);
      if (move.roll === undefined && resultKeys.length > 0) {
        error(
          file,
          `${prefix}results`,
          "a move without a roll carries no results: add a `roll` block or drop `results`"
        );
      }
      for (const key of resultKeys) {
        if (rollResults.includes(key)) continue;
        warn(
          file,
          `${prefix}results.${key}`,
          `result "${key}" is outside the game's tiers: ${list(rollResults)}`
        );
      }
    }

    for (const [node, keyPath] of walk(data, "")) {
      const prefix = at(keyPath);

      // Rule 3: equipment types exist in the game definition.
      if (
        typeof node.equipmentType === "string" &&
        !equipmentTypes.includes(node.equipmentType)
      ) {
        error(
          file,
          `${prefix}equipmentType`,
          `unknown equipment type "${node.equipmentType}"; the game declares: ${list(
            equipmentTypes
          )}`
        );
      }

      // Rules 11 and 12: a threat takes its category and its impulse from the
      // vocabularies of the game, the same way a move takes its type.
      if (/(^|\.)threats\[\d+\]$/.test(keyPath)) {
        if (typeof node.type === "string" && !threatTypes.includes(node.type)) {
          error(
            file,
            `${prefix}type`,
            `unknown threat type "${node.type}"; the game declares: ${list(
              threatTypes
            )}`
          );
        }
        if (
          typeof node.impulse === "string" &&
          !impulses.includes(node.impulse)
        ) {
          error(
            file,
            `${prefix}impulse`,
            `unknown impulse "${node.impulse}"; the game declares: ${list(
              impulses
            )}`
          );
        }
      }

      // Rule 10: a clock naming a preset names one the game declares.
      if (typeof node.preset === "string" && !clockSegments.has(node.preset)) {
        error(
          file,
          `${prefix}preset`,
          `unknown clock preset "${node.preset}"; the game declares: ${list([
            ...clockSegments.keys(),
          ])}`
        );
      }

      // Rule 9: a clock whose `filled` runs past its segments. Segments written
      // on the spot are counted here; a preset lends the length of its own.
      if (typeof node.filled === "number") {
        const segments = Array.isArray(node.segments)
          ? node.segments.length
          : typeof node.preset === "string"
            ? clockSegments.get(node.preset)
            : undefined;
        if (segments !== undefined && node.filled > segments) {
          error(
            file,
            `${prefix}filled`,
            `${node.filled} filled segments for a clock of ${segments}`
          );
        }
      }
    }

    // Rule 4: every reference field resolves, all of them alike. Content files
    // only: the game definition carries vocabularies, not references.
    for (const reference of type === "game-definition" ? [] : collectReferences(data)) {
      const known = slugsByType.get(reference.type);
      if (known !== undefined && known.has(reference.slug)) continue;
      error(
        file,
        reference.key,
        `unresolved ${reference.type} reference "${reference.slug}": no such ${reference.type} in ${path.join("examples", game.folder, reference.type)}`
      );
    }
  }
}

function run() {
  const targeted = [
    ...new Map<string, Game>(TARGETS.map((t) => [t.game.folder, t.game])).values(),
  ];
  for (const game of targeted) checkGame(game);

  const byFile = new Map<string, Diagnostic[]>();
  for (const d of diagnostics) {
    byFile.set(d.file, [...(byFile.get(d.file) ?? []), d]);
  }
  for (const [file, found] of byFile) {
    const worst = found.some((d) => d.severity === "error") ? "✗" : "⚠️ ";
    console.log(`${worst} ${file}`);
    for (const d of found) {
      console.log(`    ${d.severity} ${d.key}: ${d.message}`);
    }
  }

  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.length - errors;
  if (errors > 0) {
    console.error(
      `\n❌ Reference check failed: ${errors} error(s), ${warnings} warning(s).`
    );
    process.exit(1);
  }
  console.log(
    warnings > 0
      ? `\n✅ Reference check passed with ${warnings} warning(s).`
      : "\n✅ All references resolve."
  );
}

run();
