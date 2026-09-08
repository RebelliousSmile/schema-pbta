# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
