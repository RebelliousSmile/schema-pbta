import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData } from "./read-data.js";

type Data = Record<string, unknown>;

type PreviewDescriptor = {
  game: string;
  gameDefinition: string;
  playbook: string;
  moves: string[];
  mcMoves: string[];
  variants: string[];
  defaultVariant: string;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handbookRoot = path.join(root, "handbook");

function asData(value: unknown, context: string): Data {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context} must be an object`);
  }
  return value as Data;
}

function asStrings(value: unknown, context: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${context} must be an array of strings`);
  }
  return value as string[];
}

function descriptorFor(game: string): PreviewDescriptor {
  const file = path.join(handbookRoot, game, "preview", "preview.toml");
  const data = asData(loadData(file), file);
  return {
    game: String(data.game),
    gameDefinition: String(data.gameDefinition),
    playbook: String(data.playbook),
    moves: asStrings(data.moves, `${file}: moves`),
    mcMoves: asStrings(data.mcMoves, `${file}: mcMoves`),
    variants: asStrings(data.variants, `${file}: variants`),
    defaultVariant: String(data.defaultVariant),
  };
}

function canonical(game: string, kind: string, slug: string): Data {
  const file = path.join(root, "examples", game, kind, `${slug}.toml`);
  if (!fs.existsSync(file)) throw new Error(`Missing preview reference: ${file}`);
  return asData(loadData(file), file);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function entries(value: unknown): Array<[string, unknown]> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? Object.entries(value as Data)
    : [];
}

function list(items: unknown, className: string): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderStats(definition: Data, playbook: Data): string {
  const labels = asData(asData(definition.character, "character").stats, "character.stats");
  const values = asData(playbook.stats, "playbook.stats");
  const rows = entries(values).map(([key, value]) => `
    <div class="handbook-stat" data-stat="${escapeHtml(key)}">
      <dt>${escapeHtml(labels[key] ?? key)}</dt><dd>${escapeHtml(value)}</dd>
    </div>`).join("");
  return `<dl class="handbook-stats">${rows}\n  </dl>`;
}

function renderAttributes(definition: Data, playbook: Data): string {
  const declared = asData(asData(definition.character, "character").attributes, "character.attributes");
  const values = asData(playbook.attributes, "playbook.attributes");
  const rows = entries(values).map(([key, value]) => {
    const declaration = asData(declared[key], `attribute ${key}`);
    const rendered = Array.isArray(value) ? (value.length ? value.join(", ") : "—") : value;
    return `
    <div class="handbook-attribute" data-attribute="${escapeHtml(key)}" data-attribute-type="${escapeHtml(declaration.type)}">
      <dt>${escapeHtml(declaration.label ?? key)}</dt><dd>${escapeHtml(rendered)}</dd>
    </div>`;
  }).join("");
  return `<dl class="handbook-attributes">${rows}\n  </dl>`;
}

function renderMove(move: Data): string {
  const results = entries(move.results).map(([key, resultValue]) => {
    const result = asData(resultValue, `move result ${key}`);
    return `<div class="handbook-result" data-result="${escapeHtml(key)}"><strong>${escapeHtml(result.label ?? key)}</strong><p>${escapeHtml(result.text)}</p></div>`;
  }).join("");
  const trigger = move.trigger ? `<p class="handbook-move__trigger">${escapeHtml(move.trigger)}</p>` : "";
  return `<article class="handbook-move" data-move="${escapeHtml(move.slug)}" data-move-type="${escapeHtml(move.moveType)}" data-audience="${escapeHtml(move.audience ?? "character")}">
    <header><span class="handbook-kicker">${escapeHtml(move.moveType)}</span><h3>${escapeHtml(move.name)}</h3></header>
    <p>${escapeHtml(move.description)}</p>${trigger}
    ${results ? `<div class="handbook-results">${results}</div>` : ""}
  </article>`;
}

function renderPlaybookMoves(playbook: Data, referencedMoves: Data[]): string {
  const bySlug = new Map(referencedMoves.map((move) => [String(move.slug), move]));
  const selected = Array.isArray(playbook.moves) ? playbook.moves : [];
  const inline = selected.flatMap((rawMove) => {
    const item = asData(rawMove, "playbook move");
    if (item.ref) {
      if (!bySlug.has(String(item.ref))) throw new Error(`Playbook ${playbook.slug} references unselected move ${item.ref}`);
      return [];
    }
    return [renderMove({ ...item, slug: `embedded-${String(item.name).toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}` })];
  });
  return [...referencedMoves.map(renderMove), ...inline].join("\n");
}

function render(game: string): string {
  const descriptor = descriptorFor(game);
  if (descriptor.game !== game) throw new Error(`${game}: descriptor game mismatch`);
  if (!descriptor.variants.includes(descriptor.defaultVariant)) throw new Error(`${game}: defaultVariant is not listed`);

  const definition = canonical(game, "game-definition", descriptor.gameDefinition);
  const playbook = canonical(game, "playbook", descriptor.playbook);
  const moves = descriptor.moves.map((slug) => canonical(game, "move", slug));
  const mcMoves = descriptor.mcMoves.map((slug) => canonical(game, "move", slug));
  for (const move of mcMoves) {
    if (move.audience !== "mc") throw new Error(`${game}: ${move.slug} is not an MC move`);
  }

  const variantOptions = descriptor.variants.map((variant) => `<option value="${escapeHtml(variant)}"${variant === descriptor.defaultVariant ? " selected" : ""}>${escapeHtml(variant)}</option>`).join("");
  const creation = Array.isArray(playbook.creation) ? playbook.creation.map((raw) => {
    const item = asData(raw, "creation item");
    return `<div class="handbook-creation__item"><h3>${escapeHtml(item.label)}</h3>${list(item.options, "handbook-options")}</div>`;
  }).join("") : "";
  const mcRegion = mcMoves.length ? mcMoves.map(renderMove).join("\n") : `<p class="handbook-empty">Aucune action de MC sélectionnée pour cet aperçu.</p>`;

  return `<!doctype html>
<html lang="fr" data-game="${escapeHtml(game)}" data-variant="${escapeHtml(descriptor.defaultVariant)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(definition.name)} — Handbook preview</title>
  <link rel="stylesheet" href="../../shared/preview.css">
  <link rel="stylesheet" href="../styles/base.css">
  <link data-variant-stylesheet rel="stylesheet" disabled>
</head>
<body>
  <main class="handbook-sheet" data-handbook-preview>
    <header class="handbook-game" data-region="game-identity">
      <div><span class="handbook-kicker">Handbook preview</span><h1>${escapeHtml(definition.name)}</h1><p>${escapeHtml(definition.source)}</p></div>
      <label class="handbook-variant">Variante<select data-variant-picker>${variantOptions}</select></label>
    </header>
    <div class="handbook-layout">
      <section class="handbook-panel handbook-identity" data-region="character-identity">
        <span class="handbook-kicker">Livret</span><h2>${escapeHtml(playbook.name)}</h2><p>${escapeHtml(playbook.description)}</p>
        ${playbook.statsDetail ? `<p class="handbook-stats-detail">${escapeHtml(playbook.statsDetail)}</p>` : ""}
        ${creation ? `<div class="handbook-creation">${creation}</div>` : ""}
      </section>
      <section class="handbook-panel handbook-playbook" data-region="playbook-moves">
        <span class="handbook-kicker">Actions</span><h2>Moves du livret</h2>
        ${renderPlaybookMoves(playbook, moves)}
        ${list(playbook.advancement, "handbook-advancement")}
      </section>
      <aside class="handbook-panel handbook-state" data-region="character-state">
        <span class="handbook-kicker">État</span><h2>Caractéristiques</h2>${renderStats(definition, playbook)}
        <h2>Attributs</h2>${renderAttributes(definition, playbook)}
      </aside>
    </div>
    <footer class="handbook-panel handbook-mc" data-region="mc-actions">
      <span class="handbook-kicker">Référence MC</span><h2>Actions de MC</h2>${mcRegion}
    </footer>
  </main>
  <script>
    const picker = document.querySelector("[data-variant-picker]");
    const variantLink = document.querySelector("[data-variant-stylesheet]");
    picker?.addEventListener("change", () => {
      document.documentElement.dataset.variant = picker.value;
      if (picker.value === "base") {
        variantLink.disabled = true;
        variantLink.removeAttribute("href");
      } else {
        variantLink.href = "../styles/variants/" + picker.value + ".css";
        variantLink.disabled = false;
      }
    });
  </script>
</body>
</html>\n`;
}

const games = fs.readdirSync(handbookRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "shared")
  .map((entry) => entry.name)
  .sort();

for (const game of games) {
  const output = path.join(handbookRoot, game, "preview", "index.html");
  fs.writeFileSync(output, render(game), "utf8");
  console.log(`Rendered ${path.relative(root, output)}`);
}
