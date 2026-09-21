---
objective: "Monsterhearts skins can optionally publish strict per-stat display bounds alongside independent current values, with a consumer-readable min/current/max presentation contract in a new immutable schema major."
status: in-progress
---

# Plan: Monsterhearts per-stat display bounds

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Add optional Monsterhearts-only `statRanges`, publish its display semantics, and prepare the immutable v7 contract line without constraining current stat values. |
| **Source** | [schema-pbta #19](https://github.com/RebelliousSmile/schema-pbta/issues/19) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Add the Monsterhearts range contract and corpus | [`phase-1.md`](./phase-1.md) |
| 2 | Publish stat-range presentation semantics | [`phase-2.md`](./phase-2.md) |
| 3 | Prepare the immutable v7 contract line | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [schema-pbta #19](https://github.com/RebelliousSmile/schema-pbta/issues/19) | Ranges are optional display/editor metadata; their signed bounds must not clamp the current value. |

## Decisions

| Decision | Why |
| -------- | --- |
| Make `statRanges` a Monsterhearts-only optional record of strict `{ min, max }` entries using signed 32-bit integers. | The field belongs to skin display metadata and must neither broaden generic playbooks nor accept malformed range objects. |
| Publish a dedicated stat-range descriptor family rather than overload collection metadata. | `statRanges` is a keyed field group, not a mutable/reorderable array; the public collection API explicitly reserves other descriptor families for different presentation shapes. |
| Create v7 as the next candidate contract major and freeze v6. | `v6.0.0` already exists as an immutable tag, so changing `schemas/v6` would violate the version gate and break consumers pinned to it. |
| Do not schedule Lantern UI work in this schema plan. | The schema package owns contract and presentation semantics; Lantern owns its runtime editor and may adopt only a released schema artifact. |
