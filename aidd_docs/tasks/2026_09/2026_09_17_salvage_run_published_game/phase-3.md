---
status: done
---

# Instruction: Validate the published game

## Architecture projection

```txt
tools/ ✏️ extend assertions where the supported game count is explicit
generated schemas/ ✏️ regenerated v4 public artefacts
```

## User Journey

```mermaid
flowchart TD
  A[Examples and corpus] --> B[Contract checks]
  B --> C[Package and Handbook checks]
  C --> D[Published Salvage Run]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    install locked dependencies => validation tools are available: 5: cli
  section Happy path
    run project checks => all generated contracts and packs pass: 5: cli
  section Edge case - invalid content
    run rejection corpus => malformed Salvage Run content is rejected: 1: cli
```

## Tasks to do

### `1)` Update assertions and run the suite

> Make all supported-game expectations include Salvage Run and verify them.

1. Adapt fixed game-count checks.
2. Regenerate and run targeted validations.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | The full project check recognizes Salvage Run as a supported sixth game. |
