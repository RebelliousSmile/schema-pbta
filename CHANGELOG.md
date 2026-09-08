# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
