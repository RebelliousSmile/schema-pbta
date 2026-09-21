---
objective: "Publish a versioned Monsterhearts playbook presentation contract, including validated optional column layouts, for npm and Handbook source consumers."
status: implemented
---

# Plan: Publish the Monsterhearts presentation layout contract

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Resolve GitHub issues #16 and #20 with one producer-owned, versioned presentation contract. |
| **Source** | GitHub issues `RebelliousSmile/schema-pbta#16` and `RebelliousSmile/schema-pbta#20` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Define and validate the presentation semantics | [`phase-1.md`](./phase-1.md) |
| 2 | Publish one declaration to npm and Handbook source | [`phase-2.md`](./phase-2.md) |
| 3 | Version, release, and prove consumer delivery | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/16 | Required Monsterhearts regions, primitives, tokens, responsive/print semantics, variants, and data boundary. |
| https://github.com/RebelliousSmile/schema-pbta/issues/20 | Required optional ordered columns, rejection rules, one source for Lantern and Handbook, and Monsterhearts witness. |

## Decisions

| Decision | Why |
| --- | --- |
| A typed source descriptor is the canonical definition; a generated JSON pack artifact is its only Handbook-source projection. | Lantern imports the typed npm export while Handbook reads the identical data from an installable source path; validators prevent drift. |
| Regions name consumer capabilities, never HTML or CSS selectors. | User TOML remains portable and consumers retain runtime adapters without local game semantics. |
