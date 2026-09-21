import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData } from "./read-data.js";
import { PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION } from "../src/presentation/monsterhearts-playbook.js";

type Data = Record<string, unknown>;

type PreviewDescriptor = {
  game: string;
  gameDefinition: string;
  playbookKind?: string;
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
    playbookKind: data.playbookKind === undefined ? undefined : String(data.playbookKind),
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

function renderStatProfiles(definition: Data, playbook: Data): string {
  if (!Array.isArray(playbook.statProfiles) || playbook.statProfiles.length === 0) return "";
  const labels = asData(asData(definition.character, "character").stats, "character.stats");
  const profiles = playbook.statProfiles.map((raw) => {
    const profile = asData(raw, "stat profile");
    const values = asData(profile.stats, "stat profile stats");
    const stats = entries(values).map(([key, value]) => `${escapeHtml(labels[key] ?? key)} ${escapeHtml(value)}`).join(", ");
    return `<li data-stat-profile-key="${escapeHtml(profile.key)}" data-schema-block="stat-profile"><strong>${escapeHtml(profile.label)}</strong><span>${stats}</span></li>`;
  }).join("");
  return `<section class="handbook-stat-profiles" data-schema-block="stat-profiles"><h3>Profils de départ</h3><ul>${profiles}</ul></section>`;
}

function renderAttributes(definition: Data, playbook: Data): string {
  if (!playbook.attributes || typeof playbook.attributes !== "object" || Array.isArray(playbook.attributes)) return "";
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

function renderEditorial(playbook: Data): string {
  if (!playbook.editorial || typeof playbook.editorial !== "object" || Array.isArray(playbook.editorial)) return "";
  return Object.values(playbook.editorial as Data).map((raw) => {
    const section = asData(raw, "playbook editorial section");
    const paragraphs = asStrings(section.paragraphs, "playbook editorial paragraphs");
    return `<section class="handbook-subsection handbook-editorial" data-schema-block="editorial"><h2>${escapeHtml(section.heading)}</h2>${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`;
  }).join("\n");
}

function renderSpecializedDetails(game: string, playbook: Data): string {
  const section = (field: string, title: string, content: string): string =>
    content
      ? `<section class="handbook-subsection handbook-specialized" data-schema-block="specialized-field" data-specialized-field="${field}"><span class="handbook-kicker">Règle du livret</span><h2>${escapeHtml(title)}</h2>${content}</section>`
      : "";
  const labelledValues = (value: unknown): string => entries(value).length
    ? `<dl class="handbook-specialized-values">${entries(value).map(([key, item]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(item)}</dd></div>`).join("")}</dl>`
    : "";

  if (game === "masks") {
    return section("moment-of-truth", "Moment de vérité", `<p>${escapeHtml(playbook.momentOfTruth)}</p>`)
      + section("potential", "Potentiel", `<p>${escapeHtml(playbook.potential)}</p>`)
      + section("influence", "Influence", list(playbook.influence, "handbook-value-list"));
  }
  if (game === "monster-of-the-week") {
    return section("luck", "Chance", `<p>${escapeHtml(playbook.luck)}</p>`)
      + section("ratings", "Réserves", labelledValues(playbook.ratings))
      + section("improvements", "Améliorations", list(playbook.improvements, "handbook-advancement"));
  }
  if (game === "the-sprawl") {
    return section("directives", "Directives", list(playbook.directives, "handbook-value-list"))
      + section("mission-gear", "Équipement de mission", list(playbook.missionGear, "handbook-value-list"))
      + section("cred", "Cred", `<p>${escapeHtml(playbook.cred)}</p>`);
  }
  if (game === "urban-shadows") {
    const corruption = asData(playbook.corruption, "Urban Shadows corruption");
    const corruptionContent = corruption.trigger
      ? `<p>${escapeHtml(corruption.trigger)}</p>${list(corruption.advances, "handbook-advancement")}${list(corruption.moves, "handbook-value-list")}`
      : "";
    return section("harm", "Harm", labelledValues(playbook.harm))
      + section("corruption", "Corruption", corruptionContent)
      + section("mortal-relationships", "Relations mortelles", Array.isArray(playbook.mortalRelationships)
        ? `<ul class="handbook-value-list">${playbook.mortalRelationships.map((raw) => {
          const relationship = asData(raw, "mortal relationship");
          return `<li data-mortal-relationship-key="${escapeHtml(relationship.key)}"><strong>${escapeHtml(relationship.label)}</strong>${relationship.description ? ` — ${escapeHtml(relationship.description)}` : ""}</li>`;
        }).join("")}</ul>`
        : "")
      + section("scars", "Cicatrices", Array.isArray(playbook.scars)
        ? `<ul class="handbook-value-list">${playbook.scars.map((raw) => `<li>${escapeHtml(asData(raw, "scar").name)}</li>`).join("")}</ul>`
        : "");
  }
  return "";
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

function renderEditorialSection(region: string, section: Data): string {
  return `<section class="handbook-panel handbook-editorial handbook-editorial--${escapeHtml(region)}" data-region="monsterhearts-${escapeHtml(region)}"><h2>${escapeHtml(section.heading)}</h2>${Array.isArray(section.paragraphs) ? section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") : ""}</section>`;
}

function renderCreation(playbook: Data): string {
  if (!Array.isArray(playbook.creation)) return "";
  const questions = playbook.creation.map((raw) => {
    const item = asData(raw, "creation item");
    const attribute = typeof item.attribute === "string"
      ? ` data-creation-attribute="${escapeHtml(item.attribute)}"`
      : "";
    const selection = item.selection && typeof item.selection === "object" && !Array.isArray(item.selection)
      ? item.selection as Data
      : {};
    const cardinality = typeof selection.min === "number" && typeof selection.max === "number"
      ? ` data-creation-min="${selection.min}" data-creation-max="${selection.max}"`
      : ' data-creation-min="1" data-creation-max="1"';
    const options = Array.isArray(item.options)
      ? `<ul class="handbook-options">${item.options.map((option) => {
        const detail = option && typeof option === "object" && !Array.isArray(option)
          ? option as Data
          : {};
        const value = typeof option === "string" ? option : detail.value;
        const label = typeof option === "string" ? option : detail.label;
        return `<li data-creation-option-value="${escapeHtml(value)}">${escapeHtml(label)}</li>`;
      }).join("")}</ul>`
      : "";
    return `<section class="handbook-creation__item" data-schema-block="creation-question"${attribute}${cardinality}><h3>${escapeHtml(item.label)}</h3>${options}</section>`;
  }).join("");
  return questions ? `<div class="handbook-creation">${questions}</div>` : "";
}

function renderMonsterheartsPage(
  descriptor: PreviewDescriptor,
  definition: Data,
  playbook: Data,
  moves: Data[],
  variantOptions: string,
  creation: string,
): string {
  const editorial = asData(playbook.editorial, "Monsterhearts editorial");
  const regional = (region: string): string => {
    const section = (name: string): Data => asData(editorial[name], `Monsterhearts ${name}`);
    const editorialRegion = (name: string, field = name): string => {
      const value = section(field);
      return `<section class="handbook-panel handbook-editorial handbook-editorial--${escapeHtml(name)}" data-region="monsterhearts-${escapeHtml(name)}"><h2>${escapeHtml(value.heading)}</h2>${Array.isArray(value.paragraphs) ? value.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") : ""}</section>`;
    };
    const panel = (name: string, title: string, content: string): string =>
      `<section class="handbook-panel handbook-editorial handbook-editorial--${escapeHtml(name)}" data-region="${escapeHtml(name)}"><h2>${escapeHtml(title)}</h2>${content}</section>`;
    switch (region) {
      case "monsterhearts-opening": return editorialRegion("opening");
      case "monsterhearts-darkest-self": return editorialRegion("darkest-self", "darkestSelf");
      case "monsterhearts-sex-move": return editorialRegion("sex-move", "sexMove");
      case "character-identity": {
        const identity = section("identity");
        return panel(region, String(identity.heading), `${Array.isArray(identity.paragraphs) ? identity.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") : ""}${creation}${list(playbook.backstory, "handbook-value-list")}`);
      }
      case "stat-profiles": return panel(region, "Caractéristiques", `${renderStats(definition, playbook)}${renderStatProfiles(definition, playbook)}`);
      case "playbook-moves": return panel(region, "Actions", renderPlaybookMoves(playbook, moves, definition));
      case "relationships": {
        const strings = playbook.strings && typeof playbook.strings === "object" ? asData(playbook.strings, "Monsterhearts strings") : {};
        const ascendants = Array.isArray(playbook.ascendants) ? `<ul class="handbook-value-list">${playbook.ascendants.map((raw) => {
          const ascendant = asData(raw, "Monsterhearts ascendant");
          return `<li><strong>${escapeHtml(ascendant.name)}</strong> — ${escapeHtml(ascendant.value)}</li>`;
        }).join("")}</ul>` : "";
        return panel(region, "Strings et Ascendants", `<p>Strings : ${escapeHtml(strings.starting ?? 0)} / ${escapeHtml(strings.max ?? 0)}</p>${ascendants}`);
      }
      case "conditions-and-harm": {
        const conditions = Array.isArray(playbook.conditions) ? `<ul class="handbook-value-list">${playbook.conditions.map((raw) => {
          const condition = asData(raw, "Monsterhearts condition");
          return `<li><strong>${escapeHtml(condition.name)}</strong>${condition.description ? ` — ${escapeHtml(condition.description)}` : ""}</li>`;
        }).join("")}</ul>` : "";
        return panel(region, "Conditions et blessures", `<p>Harm : ${escapeHtml(playbook.harm ?? 0)}</p>${conditions}`);
      }
      case "gear": return panel(region, "Équipement", renderGear(playbook));
      case "monsterhearts-progression": {
        const progression = section("progression");
        const advances = Array.isArray(playbook.advances) ? `<ul class="handbook-advancement">${playbook.advances.map((raw) => {
          const advance = asData(raw, "Monsterhearts advance");
          return `<li data-checked="${advance.checked === true}">${escapeHtml(advance.label)}</li>`;
        }).join("")}</ul>` : "";
        return panel(region, String(progression.heading), `${Array.isArray(progression.paragraphs) ? progression.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") : ""}${advances}`);
      }
      default: throw new Error(`Monsterhearts preview cannot render declared region: ${region}`);
    }
  };
  const columns = PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.columns ?? [];
  const placed = new Set(columns.flat());
  const unplaced = PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION.canonicalOrder.filter((region) => region !== "game-identity" && !placed.has(region));
  const layout = [...columns, unplaced].filter((column) => column.length > 0).map((column, index) =>
    `<div class="handbook-monsterhearts-column" data-layout-column="${index + 1}">${column.map(regional).join("\n")}</div>`,
  ).join("\n");
  return `<!doctype html>
<html lang="fr" data-game="monsterhearts" data-variant="${escapeHtml(descriptor.defaultVariant)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(playbook.name)} — Monsterhearts playbook</title>
  <link rel="stylesheet" href="../../shared/preview.css">
  <link rel="stylesheet" href="../styles/base.css">
  <link data-variant-stylesheet rel="stylesheet" disabled>
</head>
<body>
  <main class="handbook-sheet handbook-monsterhearts-sheet" data-handbook-preview>
    <header class="handbook-monsterhearts-title" data-region="game-identity"><span class="handbook-kicker">Livret Monsterhearts</span><h1>${escapeHtml(playbook.name)}</h1><p>${escapeHtml(playbook.description)}</p><label class="handbook-variant">Variante<select data-variant-picker>${variantOptions}</select></label></header>
    <div class="handbook-monsterhearts-layout">
      ${layout}
    </div>
  </main>
  <script>
    const picker = document.querySelector("[data-variant-picker]");
    const variantLink = document.querySelector("[data-variant-stylesheet]");
    picker?.addEventListener("change", () => {
      document.documentElement.dataset.variant = picker.value;
      if (picker.value === "base") { variantLink.disabled = true; variantLink.removeAttribute("href"); }
      else { variantLink.href = "../styles/variants/" + picker.value + ".css"; variantLink.disabled = false; }
    });
  </script>
</body>
</html>\n`;
}

function render(game: string): string {
  const descriptor = descriptorFor(game);
  if (descriptor.game !== game) throw new Error(`${game}: descriptor game mismatch`);
  if (!descriptor.variants.includes(descriptor.defaultVariant)) throw new Error(`${game}: defaultVariant is not listed`);

  const definition = canonical(game, "game-definition", descriptor.gameDefinition);
  const playbook = canonical(game, descriptor.playbookKind ?? "playbook", descriptor.playbook);
  const moves = descriptor.moves.map((slug) => canonical(game, "move", slug));
  const mcMoves = descriptor.mcMoves.map((slug) => canonical(game, "move", slug));
  for (const move of mcMoves) {
    if (move.audience !== "mc") throw new Error(`${game}: ${move.slug} is not an MC move`);
  }

  const variantOptions = descriptor.variants.map((variant) => `<option value="${escapeHtml(variant)}"${variant === descriptor.defaultVariant ? " selected" : ""}>${escapeHtml(variant)}</option>`).join("");
  const creation = renderCreation(playbook);
  const mcRegion = mcMoves.length ? mcMoves.map((move) => renderMove(move, definition)).join("\n") : `<p class="handbook-empty">Aucune action de MC sélectionnée pour cet aperçu.</p>`;

  if (game === "monsterhearts" && descriptor.playbookKind === "monsterhearts-playbook") {
    return renderMonsterheartsPage(descriptor, definition, playbook, moves, variantOptions, creation);
  }

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
${creation}
${renderGear(playbook)}
${renderEditorial(playbook)}
${renderSpecializedDetails(game, playbook)}
      </section>
      <section class="handbook-panel handbook-playbook" data-region="playbook-moves">
        <span class="handbook-kicker">Actions</span><h2>Moves du livret</h2>
${renderPlaybookMoves(playbook, moves, definition)}
${renderChoiceSets(playbook, moves)}
${Array.isArray(playbook.advancement) && playbook.advancement.length ? `<section class="handbook-subsection"><span class="handbook-kicker">Évolution</span><h2>Progression</h2>${list(playbook.advancement, "handbook-advancement")}</section>` : ""}
      </section>
      <aside class="handbook-panel handbook-state" data-region="character-state">
        <span class="handbook-kicker">État</span><h2>Caractéristiques</h2>${renderStats(definition, playbook)}${renderStatProfiles(definition, playbook)}
        <h2>Attributs</h2>${renderAttributes(definition, playbook) || `<span data-schema-block="attribute" hidden></span>`}
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
