---
source: inline concept — shared PBTA schemas with Handbook visual packs
generated_at: 2026-09-10
---

# Shadow Areas Report

Source: conversation defining Handbook packs for `schema-pbta`
Generated: 2026-09-10

Total gaps: 11 | Blocker: 3 | Major: 6 | Minor: 2

---

## Gaps by Category

### unstated assumption

**[major]** Which parts of a playbook and a move are universal PBTA data, and which must be represented as explicit per-game extensions?
> “Les mêmes objets structurés” must support both common fields and mechanics such as faction, debt, strings, mission, or advancement without a second representation.

### ambiguous term

**[major]** What does “changer un move dans Lantern” include: text edits, outcome edits, option edits, or changes to game-specific mechanics?
> The scope determines the stable semantic contract shared by Lantern and Handbook.

### missing edge case

**[major]** How does Handbook preserve unsaved edits when a live visual variant is changed?
> Variants are intended to change in real time; the editing state and the selected variant must not conflict.

**[minor]** What fallback style applies when a game has no named variant or its selected variant is removed?
> The packs are designed to support variants even where only a default visual identity exists today.

### missing actor

**[minor]** Who approves that a game-specific visual treatment still expresses the shared semantic components correctly?
> Visual ownership and schema ownership may make different decisions unless the review role is explicit.

### missing failure mode

**[major]** What should Handbook render when a declared font or image asset cannot be loaded?
> The Adrenaline example already exposes an asset-path mismatch; packs need a usable fallback rather than a broken preview.

### missing acceptance criterion

**[blocker]** What fixture proves that a move edited in Lantern is rendered by Handbook from the same canonical data without field loss or conversion?
> This is the central interoperability claim, but it has no executable pass/fail proof yet.

**[major]** What exact visual states must every game preview demonstrate?
> A pack cannot be judged consistently without an agreed minimum such as a populated playbook, moves, choices, empty state, and light/dark states where supported.

### missing dependency

**[blocker]** Which Handbook pack contract defines manifest fields, CSS loading, image paths, HTML preview assembly, and live variant switching?
> `schema-adrenaline` supplies a useful model but not the consuming host’s complete contract; the current image placement indicates that this contract must be verified.

**[blocker]** Which canonical schemas and representative data will supply The Sprawl, Monsterhearts, and Urban Shadows?
> The current repository artifacts cover Monster of the Week and Masks; the three additional games need data contracts before their packs can demonstrate the shared model.

**[major]** Which licensed or original sources may provide the fonts, textures, and images for each game?
> Game-specific look and feel requires provenance and redistribution rights for every asset.
