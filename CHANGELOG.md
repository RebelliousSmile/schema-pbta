# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.0.0] - 2026-09-21

### Added

- Monsterhearts playbooks may publish optional signed `statRanges` display bounds independently from their current stat values.
- The package exposes Monsterhearts min/current/max presentation metadata and immutable `schemas/v7` artifacts.

## [6.0.0] - 2026-09-21

### Added

- `schemas/v6` establishes the next immutable contract line, including the
  canonical Monsterhearts playbook schema and matching package exports.

### Changed

- Monsterhearts collection metadata and Handbook previews now expose only the
  canonical editorial regions: opening, darkest self, sex move, identity and
  progression.

### Removed

- The Monsterhearts specialised playbook contract no longer accepts or requires
  `editorial.playAdvice` and `editorial.mcGuidance`; their prose belongs in the
  surrounding Markdown description rather than the playbook data block.

## [5.6.0] - 2026-09-20

### Added

- `crossToolProviderSchema` types `cross-tool-provider.json` and is exported from
  the package. It is deliberately provider-agnostic: `provider` is a free string
  and `contractVersion` optional, because the same descriptor exists in
  schema-in-the-mist and schema-adrenaline without that field, and a schema that
  rejected two of the three descriptors it validates would be useless.
- `validate:cross-tool:provider` joins the `check` chain: it resolves this
  repository's `corpus` and pack manifest glob on disk, requires `provider` to
  equal the package name, requires `contractVersion` to be present and match
  `PBTA_CONTRACT_VERSION`, and proves the shared schema still accepts both
  foreign descriptor shapes from frozen witnesses.
- The consumer check in `validate:package` parses the published descriptor with
  the published schema instead of asserting three fields by hand.

### Changed

- `validate:cross-tool` parses every provider descriptor through the schema and
  resolves each declared `corpus` on disk. A dead corpus path used to cost
  nothing, because the orchestrator read only three of the descriptor's fields.
- Deviations the neighbouring repositories have not fixed yet are recorded in
  `KNOWN_DEVIATIONS` with the issue that tracks each one, and printed on every
  run. The list fails on an unrecorded deviation and fails again on a recorded
  one that has been repaired without being removed, so it cannot outlive the
  anomalies it records.

### Fixed

- `validate:release` no longer hands `tar` an absolute Windows path. GNU tar reads
  the `C:` of such a path as a remote host and fails; the tarball is now named
  relatively from the extraction directory, which both GNU tar and the bsdtar
  Windows ships accept.

## [5.5.0] - 2026-09-20

### Added

- Pack manifests: `packs/<id>/pack-contract.json` declares which codec targets a
  pack documents, with a corpus fixture and a mutable field per target.
  `npm run validate:packs` checks every manifest and proves that each
  specialised target is documented by exactly one pack.
- `create:pack` scaffolds a manifest from an accepted corpus witness.
- `cross-tool-provider.json` describes this provider to its hosts: corpus, pack
  manifest glob, capabilities and the command that validates one pack.
- `validate:cross-tool` runs the three schema providers and both hosts from a
  single configuration, so a change is measured where it is consumed.
- Every cross-tool checkout is pinned: `cross-tool.config.json` carries a clone
  URL and a full commit sha per participant, `tools/checkout-cross-tool.mjs`
  materialises them without dependencies, and `validate:cross-tool:pins`
  refuses a mutable ref, a missing origin or a CI job that stopped running the
  gate.
- The published tarball now carries `packs/` and `cross-tool-provider.json`,
  so a consumer installed from a release can read each `pack-contract.json`
  and check pack coverage instead of inferring it from the contract corpus.
- `schema-pbta/packs/*` and `schema-pbta/cross-tool-provider.json` are exported
  subpaths, resolvable with `import.meta.resolve`.

### Changed

- The package guard installs the tarball and walks every published pack
  manifest: each pack id matches its directory, each declared fixture resolves
  through the published corpus and parses under its codec, and every
  specialised codec target is documented by a pack the consumer can read.

## [5.4.0] - 2026-09-18

### Added

- A closed, runtime-validated vocabulary of PbtA collection adapter keys, with
  a published invalid presentation fixture for unknown keys.

### Changed

- Collection presentation documentation now makes the schema-to-consumer
  boundary explicit: consumer registries own implementations and fail closed.

## [5.1.0] - 2026-09-18

### Added

- Urban Shadows now publishes canonical mortal-relationship labels, stable
  creation choices, exact selection bounds and a complete specialised TOML
  round-trip witness for downstream consumers.

### Changed

- Reference validation rejects Urban Shadows relationship creation data whose
  stable values or display labels diverge from the canonical fixtures.

## [5.0.0] - 2026-09-18

### Added

- An original Salvage Run sample game, including its canonical playbook and
  generated v5 schema artifacts.
- Editable Monsterhearts ascendants, persistent acquisition states for moves
  and advancements, and rejection coverage for invalid states.
- Structured playbook-creation destinations: single Text/LongText results,
  bounded ListMany selections with stable values, and named starting-stat
  profiles.
- Explicit Salvage Run Name/Look fields and finite starting profiles; Urban
  Shadows mortal-relationship catalogues now preserve editorial descriptions
  separately from their selected keys.

### Changed

- Specialized Monsterhearts, Monster of the Week and Urban Shadows progressions
  now share the portable `{ label, checked }` acquisition entry.
- Reference validation and Handbook previews now expose and validate creation
  destinations, selection cardinality and stat-profile data without deriving
  mechanics from prose.

## [4.0.0] - 2026-09-17

### Added

- Canonical, single-TOML specialized playbook contracts for Masks, Monster of
  the Week and The Sprawl, joining Monsterhearts and Urban Shadows.
- Handbook previews now render editorial regions and game-specific playbook
  mechanics directly from every canonical specialized fixture.
- Public v4 codecs, JSON Schemas, corpus coverage and installed-tarball checks
  for all five specialized playbook targets.

### Changed

- A move's `playbook` reference now resolves only to its game's specialized
  canonical target; generic `playbook` remains an interchange format and can
  no longer act as a second canonical fixture.

## [3.0.0] - 2026-09-17

### Added

- A complete, single-document Monsterhearts playbook contract in v3, including
  editorial regions for the opening, advice, Darkest Self, sex move, MC
  guidance, identity and progression.
- Canonical single-TOML fixtures for La Selkie, La Noyée and The Eclipse, plus
  contract witnesses and rejection coverage for missing editorial regions.
- A generated Monsterhearts Handbook preview sourced directly from La Selkie,
  preserving the three-column playbook composition.
- `schemas/v3` and public package exports for the v3 candidate contract.

### Changed

- Archived v1 and v2 schemas are now verified byte-for-byte against their
  immutable release tags during compatibility validation.

## [0.3.0] - 2026-09-10

### Added

- A versioned `handbook.json` source publishing five declarative Handbook 2.7.1
  presentation packs in one transaction, with original SVG assets and the
  optional Monsterhearts `drowned-lake` variant.
- Closed catalogue and payload validation, rejection fixtures, autonomous CI,
  and an optional cross-repository assertion using Handbook's real installer.
- MC move vocabularies and an optional move audience, with cross-reference
  checks and temporary fixture coverage for MC-only types.
- Canonical game definitions for Monsterhearts 2, Urban Shadows 2e and The
  Sprawl 1.1, each with generated schemas and positive/negative audit fixtures.
- Original move, MC-action and playbook fixtures for all three games, including
  French character-sheet vocabulary from The Sprawl 1.1 VF.
- A Handbook v1 root catalogue with installable manifests for all five games,
  six original SVG assets and the visual-only Monsterhearts `drowned-lake`
  variant. This is a repository payload, not an npm release.
- Autonomous catalogue validation and rejection fixtures covering paths,
  versions, variants, safe tokens, assets and executable-content exclusion,
  plus CI running the complete repository check.
- An optional integration assertion that installs and updates the full source
  through Handbook's real installer and proves rollback after a late failure.
- Generated semantic Handbook previews kept separate from the installable
  manifests and assets.

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
