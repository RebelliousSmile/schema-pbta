# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- MC move vocabularies and an optional move audience, with cross-reference
  checks and temporary fixture coverage for MC-only types.
- Canonical game definitions for Monsterhearts 2, Urban Shadows 2e and The
  Sprawl 1.1, each with generated schemas and positive/negative audit fixtures.

## [0.2.0] - 2026-09-09

### Added

- A blocking schema audit for every declared game/target pair: draft-7 validity,
  Ajv compilation, canonical `$id`, complete property descriptions, finite
  numeric bounds, executable `.refine()` / `.default()` detection, and a
  positive/negative JSON corpus. `npm run check` now begins with TypeScript
  checking and ends with this audit.

### Fixed

- `ListMany` no longer requires `options`. The Foundry sheet configurations of
  Masks (`philote/masks-newgeneration-unofficial`), Urban Shadows
  (`philote/urban-shadows-pbta`) and Monsterhearts
  (`YanKlInnomme/FoundryVTT-monsterhearts`) each declare `ListMany` attributes
  carrying no options at all — advancements, inventions, doom marks — whose
  entries are added at play time, and all three were rejected for it. An absent
  key now says that; an empty array stays a mistake, the `min(1)` still applying
  when the key is written. `ListOne` keeps `options` required: a list with
  nothing to pick has no such reading. Measured against the three configurations
  transcribed and run through Ajv: Monsterhearts drops from three rejects to one,
  Masks loses four of nine.

### Changed

- All generated schemas now publish canonical raw-GitHub identities and field
  descriptions. Numeric values use rule-derived limits where available and an
  explicit 32-bit transport range otherwise; values outside those ranges that
  were previously accepted are now rejected.
- The French terminology gap is downgraded from blocker to major and reframed as
  a localization question. The upstream concept is single — English says `move`
  everywhere — and French publishers pick either the literal rendering
  ("manœuvre") or the functional one ("action"), so the divergence touches
  display labels only, never a key or a schema shape. The shadow report now
  counts 3 blockers, 13 majors, 3 minors.

## [0.1.0] - 2026-09-08

### Added

- Verification of the delivered schemas against nine published character sheets,
  transcribed to TOML and run through Ajv: the game definitions hold, the
  playbook schema fails in five places traced to four causes, and the findings
  carry a shadow-areas report of 19 gaps. Documented under
  `aidd_docs/tasks/2026_09/2026_09_08_schemas-pbta-lantern/`.
- Monster of the Week, second game through the chain: five schemas, a game
  definition whose `harm` is a Clock for hunters and a Resource for adversaries,
  the six-step countdown as a clock preset, and an invented mystery, playbook,
  monster and two moves. No schema needed a change to take it.
- Front schema, generic across games: threat categories, impulses and clock
  presets are declared in the game definition, which the reference pass now
  checks a front against. An invented Masks front exercises both clock shapes.
- NPC schema, reusing the shared move entry, with an invented Masks adversary.
- Reference validator, a second validation pass over the corpus: vocabulary,
  reference resolution, slug uniqueness and cross-field agreement, chained into
  `npm run check`.
- Playbook schema, with `moveEntry` shared from the move module: a move is
  either cited by slug or written inline, never both; an invented Masks playbook
  exercises both branches.
- Move schema, plain text rather than the HTML upstream stores, with an optional
  roll block and a free-keyed `results` table; two invented Masks moves.
- Game definition schema, covering the eleven attribute types of the Foundry
  `pbta` system, plus the first target and the first example: Masks.
- Repository skeleton: Zod → JSON Schema generation, example validation and a
  TOML-to-JSON helper, derived from `4rtamis/schema-in-the-mist` under MIT. No
  schema target is declared yet.
