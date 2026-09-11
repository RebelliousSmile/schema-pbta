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

function tags(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<ul class="handbook-tags" aria-label="Tags">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function pips(count: number, filled: number, className: string): string {
  const visualCount = Math.min(Math.max(1, count), 12);
  const visualFilled = count > visualCount
    ? Math.round((Math.min(Math.max(0, filled), count) / count) * visualCount)
    : Math.min(Math.max(0, filled), visualCount);
  return `<span class="${className}" aria-hidden="true">${Array.from({ length: visualCount }, (_, index) =>
    `<span${index < visualFilled ? ` data-filled="true"` : ""}></span>`).join("")}</span>`;
}

function slugify(value: unknown): string {
  return String(value)
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function renderStats(definition: Data, playbook: Data): string {
  const labels = asData(asData(definition.character, "character").stats, "character.stats");
  const values = asData(playbook.stats, "playbook.stats");
  const rows = entries(values).map(([key, value]) => `
    <div class="handbook-stat" data-stat="${escapeHtml(key)}" data-schema-block="stat">
      <dt>${escapeHtml(labels[key] ?? key)}</dt><dd>${escapeHtml(value)}</dd>
    </div>`).join("");
  return `<dl class="handbook-stats">${rows}\n  </dl>`;
}

function renderAttributes(definition: Data, playbook: Data): string {
  const declared = asData(asData(definition.character, "character").attributes, "character.attributes");
  const values = asData(playbook.attributes, "playbook.attributes");
  const rows = entries(values).map(([key, value]) => {
    const declaration = asData(declared[key], `attribute ${key}`);
    const type = String(declaration.type);
    const label = escapeHtml(declaration.label ?? key);
    let control: string;
    if (["Clock", "Xp", "Resource"].includes(type) && typeof value === "number") {
      const declaredMax = typeof declaration.max === "number" ? declaration.max : 0;
      const segmentCount = Math.max(declaredMax, value, 1);
      control = `<span class="handbook-track" aria-label="${escapeHtml(value)} sur ${escapeHtml(declaredMax || "une valeur non bornée")}">${pips(segmentCount, Math.max(0, value), "handbook-track__segments")}<strong>${escapeHtml(value)}${declaredMax ? ` / ${escapeHtml(declaredMax)}` : ""}</strong></span>`;
    } else if (type === "Checkbox" && typeof value === "boolean") {
      control = `<span class="handbook-check" data-checked="${value}" aria-label="${value ? "Coché" : "Non coché"}"></span>`;
    } else if (Array.isArray(value)) {
      control = value.length
        ? `<ul class="handbook-value-list">${value.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : `<span class="handbook-empty-value">À compléter</span>`;
    } else {
      control = `<span class="handbook-attribute__value">${escapeHtml(value)}</span>`;
    }
    return `
    <div class="handbook-attribute" data-attribute="${escapeHtml(key)}" data-attribute-type="${escapeHtml(type)}" data-schema-block="attribute">
      <dt>${label}<small>${escapeHtml(type)}</small></dt><dd>${control}</dd>
    </div>`;
  }).join("");
  return `<dl class="handbook-attributes">${rows}\n  </dl>`;
}

function renderMove(move: Data, definition: Data, startingMoves: Set<string> = new Set()): string {
  const character = asData(definition.character, "character");
  const statLabels = asData(character.stats, "character.stats");
  const results = entries(move.results).map(([key, resultValue]) => {
    const result = asData(resultValue, `move result ${key}`);
    return `<div class="handbook-result" data-result="${escapeHtml(key)}" data-schema-block="result"><strong>${escapeHtml(result.label ?? key)}</strong><p>${escapeHtml(result.text)}</p></div>`;
  }).join("");
  const roll = move.roll ? asData(move.roll, `move ${String(move.slug)} roll`) : null;
  const rollLabel = roll
    ? roll.rollType === "formula"
      ? String(roll.rollFormula ?? definition.rollFormula)
      : roll.rollType === "none"
        ? "Sans jet"
        : `2d6 + ${String(statLabels[String(roll.rollType)] ?? roll.rollType)}${typeof roll.rollMod === "number" && roll.rollMod !== 0 ? ` ${roll.rollMod > 0 ? "+" : "−"} ${Math.abs(roll.rollMod)}` : ""}`
    : "";
  const trigger = move.trigger ? `<aside class="handbook-callout handbook-move__trigger" data-callout="trigger"><strong>Déclencheur</strong><p>${escapeHtml(move.trigger)}</p></aside>` : "";
  const choices = move.choices ? `<aside class="handbook-callout handbook-move__choices" data-callout="choice"><strong>Choix</strong><p>${escapeHtml(move.choices)}</p></aside>` : "";
  const uses = typeof move.uses === "number" ? `<span class="handbook-uses" aria-label="${escapeHtml(move.uses)} utilisations">${pips(move.uses, move.uses, "handbook-uses__pips")}<small>${escapeHtml(move.uses)} utilisations</small></span>` : "";
  const isStarting = startingMoves.has(String(move.slug));
  return `<article class="handbook-move" data-move="${escapeHtml(move.slug)}" data-move-type="${escapeHtml(move.moveType)}" data-audience="${escapeHtml(move.audience ?? "character")}" data-schema-block="move"${isStarting ? ` data-starting-move="true"` : ""}>
    <header><div><span class="handbook-kicker">${escapeHtml(move.moveType)}${isStarting ? " · départ" : ""}</span><h3>${escapeHtml(move.name)}</h3></div>${rollLabel ? `<span class="handbook-roll" data-schema-block="roll">${escapeHtml(rollLabel)}</span>` : ""}</header>
    <p>${escapeHtml(move.description)}</p>${trigger}
${choices}${uses}${tags(move.tags)}
${results ? `<div class="handbook-results">${results}</div>` : ""}
  </article>`;
}

function renderPlaybookMoves(playbook: Data, referencedMoves: Data[], definition: Data): string {
  const bySlug = new Map(referencedMoves.map((move) => [String(move.slug), move]));
  const selected = Array.isArray(playbook.moves) ? playbook.moves : [];
  const startingMoves = new Set(Array.isArray(playbook.startingMoves) ? playbook.startingMoves.map(String) : []);
  const inline = selected.flatMap((rawMove) => {
    const item = asData(rawMove, "playbook move");
    if (item.ref) {
      if (!bySlug.has(String(item.ref))) throw new Error(`Playbook ${playbook.slug} references unselected move ${item.ref}`);
      return [];
    }
    return [renderMove({ ...item, slug: `embedded-${slugify(item.name)}` }, definition, startingMoves)];
  });
  return [...referencedMoves.map((move) => renderMove(move, definition, startingMoves)), ...inline].join("\n");
}

function renderChoiceSets(playbook: Data, referencedMoves: Data[]): string {
  if (!Array.isArray(playbook.choiceSets) || playbook.choiceSets.length === 0) return "";
  const bySlug = new Map(referencedMoves.map((move) => [String(move.slug), move]));
  const groups = playbook.choiceSets.map((rawSet) => {
    const choiceSet = asData(rawSet, "choice set");
    const choices = Array.isArray(choiceSet.choices) ? choiceSet.choices.map((rawChoice) => {
      const choice = asData(rawChoice, "choice");
      const referenced = choice.ref ? bySlug.get(String(choice.ref)) : undefined;
      const name = referenced?.name ?? choice.name ?? choice.ref;
      const availability = Number(choice.granted) > 0 ? "Disponible au départ" : Number(choice.advancement) > 0 ? `Progression ${choice.advancement}` : "À choisir";
      return `<li class="handbook-choice" data-schema-block="choice"><span class="handbook-choice__mark" aria-hidden="true"></span><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(availability)}</small></span></li>`;
    }).join("") : "";
    return `<section class="handbook-choice-set" data-choice-type="${escapeHtml(choiceSet.type)}" data-schema-block="choice-set"><header><h3>${escapeHtml(choiceSet.title)}</h3><span>${choiceSet.type === "multi" ? "Choix multiples" : "Choix unique"}</span></header>${choiceSet.description ? `<p>${escapeHtml(choiceSet.description)}</p>` : ""}<ul>${choices}</ul></section>`;
  }).join("");
  return `<section class="handbook-subsection handbook-choice-sets"><span class="handbook-kicker">Sélection</span><h2>Choix du livret</h2>${groups}</section>`;
}

function renderGear(playbook: Data): string {
  if (!Array.isArray(playbook.gear) || playbook.gear.length === 0) return "";
  const items = playbook.gear.map((rawGear) => {
    const gear = asData(rawGear, "gear");
    const quantity = typeof gear.quantity === "number" ? `<span class="handbook-gear__quantity">×${escapeHtml(gear.quantity)}</span>` : "";
    return `<li class="handbook-gear" data-schema-block="gear"><div><strong>${escapeHtml(gear.name)}</strong>${gear.equipmentType ? `<small>${escapeHtml(gear.equipmentType)}</small>` : ""}</div>${quantity}${gear.description ? `<p>${escapeHtml(gear.description)}</p>` : ""}${tags(gear.tags)}</li>`;
  }).join("");
  return `<section class="handbook-subsection handbook-gear-list"><span class="handbook-kicker">Inventaire</span><h2>Équipement</h2><ul>${items}</ul></section>`;
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
    return `<section class="handbook-creation__item" data-schema-block="creation-question"><h3>${escapeHtml(item.label)}</h3>${list(item.options, "handbook-options")}</section>`;
  }).join("") : "";
  const mcRegion = mcMoves.length ? mcMoves.map((move) => renderMove(move, definition)).join("\n") : `<p class="handbook-empty">Aucune action de MC sélectionnée pour cet aperçu.</p>`;

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
${playbook.statsDetail ? `<aside class="handbook-callout handbook-stats-detail" data-callout="rule"><strong>Répartition de départ</strong><p>${escapeHtml(playbook.statsDetail)}</p></aside>` : ""}
${creation ? `<div class="handbook-creation">${creation}</div>` : ""}
${renderGear(playbook)}
      </section>
      <section class="handbook-panel handbook-playbook" data-region="playbook-moves">
        <span class="handbook-kicker">Actions</span><h2>Moves du livret</h2>
${renderPlaybookMoves(playbook, moves, definition)}
${renderChoiceSets(playbook, moves)}
${Array.isArray(playbook.advancement) && playbook.advancement.length ? `<section class="handbook-subsection"><span class="handbook-kicker">Évolution</span><h2>Progression</h2>${list(playbook.advancement, "handbook-advancement")}</section>` : ""}
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
