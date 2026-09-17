---
status: done
---

# Instruction: Recover canonical Salvage Run content

## Architecture projection

```txt
examples/salvage-run/ ✅ game definition, moves, and specialised playbook
corpus/temoins/salvage-run/ ✅ accepted documents for the recovered content
```

## User Journey

```mermaid
flowchart TD
  A[Canonical TOML] --> B[Parse under Salvage Run schemas]
  B --> C[Recover The Wrench and its move references]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    prepare recovered TOML => source files exist: 5: cli
  section Happy path
    parse and validate all Salvage Run documents => normalized documents are accepted: 5: cli
  section Edge case - references
    parse The Wrench => referenced moves resolve: 1: cli
```

## Tasks to do

### `1)` Transcribe the Lantern samples

> Recover the game definition, playbook, and referenced moves in canonical TOML.

1. Add original Salvage Run examples.
2. Add matching accepted corpus witnesses.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | The recovered content is accepted and The Wrench has no broken move references. |
