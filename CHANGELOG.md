# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [10.0.1] - 2026-10-08

### Changed

- Urban Shadows presentation contract: the booklet regions are spread across three balanced columns, the presentation source (`src/presentation/urban-shadows-playbook.ts`) now declares those rows (a row holds one to three columns), the regions placed beside the moves belong to the first face so a row still keeps to one face, and the stylesheet aligns checkboxes on the first line of their text.

## [Unreleased]

### Breaking

- New schema major `13.0.0` (`schemas/v13`, immutable tag `v13.0.0`, `PBTA_CONTRACT_VERSION` 13). `schemas/v12` stays as committed and joins the archived majors checked against their tag. The Sprawl playbook gains the rubrics of its printed booklet and five new documents describe the matrix (`the-sprawl-matrix`), the mission (`the-sprawl-mission`), the threat (`the-sprawl-threat`), the corporation (`the-sprawl-corporation`) and the resource (`the-sprawl-resource`); every new playbook field is optional, so a v12 document is still accepted. Pack manifests and `cross-tool-provider.json` declare `contractVersion` 13.

- New schema major `12.0.0` (`schemas/v12`, immutable tag `v12.0.0`, `PBTA_CONTRACT_VERSION` 12). `schemas/v11` stays as committed and joins the archived majors checked against their tag. The Monster of the Week playbook gains the rubrics of its printed sheet (hunter name, Luck, harm and experience boxes, special weapon, stat choices, look, introductions, history, advancements, notes), and three new documents describe the team playbook (`monster-of-the-week-team`), the monster sheet (`monster-of-the-week-monster`) and the threat page (`monster-of-the-week-threat`); every new playbook field is optional, so a v11 document is still accepted. Pack manifests and `cross-tool-provider.json` declare `contractVersion` 12.

- New schema major `11.0.0` (`schemas/v11`, immutable tag `v11.0.0`, `PBTA_CONTRACT_VERSION` 11). `schemas/v10` stays as committed and joins the archived majors checked against their tag. The Masks playbook gains the rubrics of both faces of its printed sheet and a new `masks-npc` document describes the Masks non-player character card; every new `masks-playbook` field is optional, so a v10 document is still accepted. Pack manifests and `cross-tool-provider.json` declare `contractVersion` 11.

- New schema major `10.0.0` (`schemas/v10`, immutable tag `v10.0.0`, `PBTA_CONTRACT_VERSION` 10). `schemas/v9` stays as committed and joins the archived majors checked against their tag. The Urban Shadows playbook gains the rubrics of both faces of its printed sheet; every new field is optional, so a v9 document is still accepted. Pack manifests and `cross-tool-provider.json` declare `contractVersion` 10.

- New schema major `9.0.0` (`schemas/v9`, immutable tag `v9.0.0`, `PBTA_CONTRACT_VERSION` 9). `schemas/v8` is restored byte for byte and stays frozen. The Monsterhearts playbook changes shape (optional `editorial.play`, French region labels, `ascendants-and-conditions` region replacing `relationships` and `conditions-and-harm`), so it cannot ship in v8; v9 carries every game, like each previous major. Pack manifests and `cross-tool-provider.json` declare `contractVersion` 9. The package version is bumped to `9.0.0` ahead of the release, as for v7 and v8; the `v9.0.0` tag is not created yet and `validate:version` treats `schemas/v9` as the candidate baseline until it is published.

### Changed

- Masks Handbook pack `0.3.0`: navy and gold light theme, Staatliches, Josefin Sans, Crimson Pro and Comic Neue shipped as WOFF2 with their OFL licences, page, callout and booklet layout stylesheets, and star bullet and skyline images. The pack requires `presentation:pbta-layout`; the preview renders the booklet and the NPC card.
- A pack manifest's `presentation` is a list of contracts (`packPresentationSchema`), so a pack can publish a layout and an appearance side by side. Monsterhearts declares its two contracts in that form.
- Urban Shadows Handbook pack `0.3.0`: violet headings on pale paper (`#682865`), Caveat Brush as the brush face (OFL 1.1, shipped with its licence), page and callout stylesheets, and a night section published as `style.section.note` with an original window texture. The pack stays light only; `validate:packs` accepts `section.note` and checks the layer's code tokens.
- Every PbtA Handbook pack is light only: The Sprawl moves from `polarities = ["dark"]` to `["light"]` with a light palette, and the validator now expects `light` for all packs.
- Publish the Monsterhearts note callouts `monsterhearts-note` (hatched light frame) and `monsterhearts-note-dark` (dark panel) through `PBTA_PACK_CALLOUTS`.

- Monsterhearts regions carry a French `label`; `relationships` and `conditions-and-harm` merge into `ascendants-and-conditions` ("Ascendants & conditions") and a `monsterhearts-play` region ("Jouer la mue") binds `editorial.play`.
- Monsterhearts body text uses Alice Regular (identified in the design PDF); titles use Yellow Magician (CC BY-SA 3.0) and unbolded sub-headings use El Messiri (OFL 1.1), the design fonts. The opening catchphrase uses IM Fell Double Pica Italic (OFL 1.1), the italic the booklet embeds, exposed as the `--monsterhearts-script-font` token. IM Fell English is no longer shipped. Each font ships with its licence.

### Added

- Masks playbook: optional `heroName`, `drives`, `conditions` with checked state, `statRanges`, `momentUnlocked`, `potentialMax`, `influenceOptions`, `backstory`, `relationships` and `editorial` rubrics, so the extended booklet (recto and verso) fits one TOML. None of them is required.
- `masks-npc` document (`src/zod/masks-npc.ts`, `examples/masks/masks-npc/`): the Masks NPC card with Resistance, Conditions, Self range, worst and best Self, Drive and moves, with a positive and a negative corpus.
- Masks playbook and NPC presentation (`PBTA_MASKS_PLAYBOOK_PRESENTATION`, `PBTA_MASKS_NPC_PRESENTATION`, `packs/masks/presentation-contract.json`, `packs/masks/npc-presentation-contract.json`): thirteen booklet regions over two faces and eight card regions over stacked rows, with French labels and the `boxes`, `track`, `list`, `key-value`, `prose` and `portrait` primitives.
- Masks appearance (`PBTA_MASKS_APPEARANCE`, `packs/masks/appearance-contract.json`) with its token stylesheet; fonts stay under `handbook/masks/`.
- Seven Masks callouts in `PBTA_PACK_CALLOUTS`: `masks-read-aloud`, `-sidebar`, `-move`, `-crisis`, `-caption`, `-portrait` and `-chapter`.
- Presentation fixtures for Masks (three accepted, ten rejected) and matching checks in `validate:contract`, `validate:package`, `validate:packs` and `handbook:validate`.

- Urban Shadows playbook presentation (`PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION`, `packs/urban-shadows/presentation-contract.json`): nineteen regions with French labels over two faces, each bound to fields the playbook schema declares, with the `circle-status`, `check-list` and `box-track` primitives.
- Urban Shadows appearance (`PBTA_URBAN_SHADOWS_APPEARANCE`, `packs/urban-shadows/appearance-contract.json`) with its fonts, images and token stylesheet under `packs/urban-shadows/`.
- Six Urban Shadows callouts in `PBTA_PACK_CALLOUTS`: `urban-shadows-move`, `-choice`, `-aside`, `-solid`, `-archetype` and `-example`.
- Presentation fixtures for Urban Shadows (two accepted, two rejected) and matching checks in `validate:contract`, `validate:package` and `validate:packs`.
- Urban Shadows playbook: optional `advancementCircles` (Circles carrying an advancement mark, keys of `stats`), `laterAdvancement` (second advancement list), `letItOut`, `intimacy`, `debts`, `extras` (titled frames proper to a playbook: `key`, `label`, optional `text` and `items`) and `corruption.track` (number of boxes, at least 1). None of them carries play state.
- Collection editors for the new Urban Shadows lists, all on existing item editors (`pbta-text`, `pbta-advancement`); `PBTA_COLLECTION_ITEM_EDITORS` is unchanged.
- Cross-pass rules: an advancement Circle must be a key of the playbook's `stats`, and frame keys are unique within a playbook.
- Witness `urban-shadows-playbook-blank.toml` (the v9 witness, unchanged) and two rejections (`corruption.track` at zero, unknown field under `extras`).
- Optional `editorial.play` ("Jouer la X") on the Monsterhearts playbook, with a witness, a rejection and a collection editor.

### Removed

- The Monsterhearts `drowned-lake` variant (stylesheet, `zine-lake.svg`, `variant-mark` asset, pack manifest entry and corpus witness) from both `handbook/` and `packs/`. The appearance and presentation contracts keep a single `base` variant.

## [8.4.3] - 2026-09-25

### Fixed

- Keep the Vite-only Monsterhearts asset URL registry behind an explicit browser export so ordinary package-root imports bundle and execute safely as CommonJS.
- Require Lantern's built Vite assets and Handbook's real Obsidian 1.13.7 plugin load in release-train evidence before promotion.

## [8.4.2] - 2026-09-23

### Added

- Publish immutable release candidates and gate final promotion on matching protocol-1 adoption evidence from the Lantern and Handbook consumers.

## [8.4.1] - 2026-09-22

### Fixed

- Export `PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS`, a browser-safe ESM URL API for every Monsterhearts font and logical SVG asset, and verify it through a Vite build from the packed archive.

## [8.4.0] - 2026-09-22

### Added

- Publish a consumer-neutral Monsterhearts appearance bundle with resolved base and Drowned Lake tokens, redistributable resources, and clean-tarball validation.

## [8.3.0] - 2026-09-22

### Changed

- Give the Monsterhearts portrait its own middle cell in the first three-column row, between editorial content and moves. A second row holds the remaining playbook regions.

## [8.2.0] - 2026-09-22

### Added

- Reserve a portrait region at the top of the Monsterhearts playbook's second column. The preview shows an image when `playbookImage` is set and a placeholder otherwise.

## [8.1.8] - 2026-09-22

### Fixed

- Separate Monsterhearts clock segment numbers from Obsidian task checkboxes so both remain legible.

## [8.1.7] - 2026-09-22

### Fixed

- Monsterhearts clocks show their native clock icon and render checklist items as numbered progress segments.

## [8.1.6] - 2026-09-22

### Fixed

- Put the Monsterhearts playbook name on a vertical page spine in the preview, while keeping the name visible in the heading and the spine separate from callouts.

## [8.1.5] - 2026-09-22

### Fixed

- Use white paper for the Monsterhearts pack's note and preview backgrounds; reserve neutral grey for secondary surfaces. The Drowned Lake variant keeps its dark palette.

## [8.1.4] - 2026-09-22

### Fixed

- Monsterhearts now bundles Averia Serif Libre Bold as its second typeface and uses it for editorial callout headings and bold move passages.

## [8.1.3] - 2026-09-22

### Fixed

- Monsterhearts now bundles and loads IM Fell English for its notes, headings and callouts, with system serif fallbacks when the font cannot load.

## [8.1.2] - 2026-09-22

### Changed

- Monsterhearts callouts now use hatched editorial frames, chapter-style move headings and shaded reaction rows, with a dark adaptation for Drowned Lake.

### Fixed

- CI checks out the pinned Handbook consumer before running the source-installation validation.

## [8.1.1] - 2026-09-22

### Added

- All six Handbook packs now provide their own CSS presentation for the eight shared PbtA callouts, including the optional clock, move, NPC reaction and playbook change callouts.
- A shared Markdown note demonstrates the callouts, clock segments, progression, links and NPC reactions.

## [8.1.0] - 2026-09-22

### Added

- A shared, optional visual callout contract for clocks, moves, NPC reactions and playbook changes, independent of game data and rules.
- Validation of pack stylesheet assets and their scoped callout styles.

## [8.0.0] - 2026-09-21

### Added

- Published Monsterhearts layout and collection presentation semantics, including the presentation artifact.
- Tagged releases now publish their assets through the release workflow.

### Fixed

- Removed a stale schema mirror and corrected release checksum verification and version quoting.

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

## [5.3.0] - 2026-09-18

### Added

- Closed adapter keys for PbtA collection presentation metadata.

## [5.2.0] - 2026-09-18

### Added

- Published PbtA collection presentation metadata.

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

## [2.0.0] - 2026-09-16

### Added

- Specialized Monsterhearts and Urban Shadows playbook contracts and portable Handbook capabilities.
- Validation of the canonical PbtA corpus outside a network connection.

### Changed

- Specialized playbooks became the v2 contract, superseding the v1 shape.

## [1.0.0] - 2026-09-11

### Added

- The canonical PbtA contract, shared corpus and immutable package release.
- The PbtA Handbook catalogue and Monsterhearts playbook presentation, including Drowned Lake contrast and table styles.

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
