---
objective: "Issue #7 publishes a schema-owned Urban Shadows mortal-relationship creation destination, complete with authoritative options, exact selection bounds, and contract coverage that Lantern can consume without a fallback."
status: in-progress
---

# Plan: Publish the Urban Shadows relationship creation destination

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Complete the canonical Urban Shadows fixtures and validation evidence for the mortal-relationship creation path. |
| **Source** | [GitHub issue #7](https://github.com/RebelliousSmile/schema-pbta/issues/7) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Canonical relationship source and semantic validation | [phase-1.md](./phase-1.md) |
| 2 | Contract witness and completion gates | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/7 | Requires a canonical ListMany destination and options, three editorial relationships, a structured exactly-three-choice creation question, and manifest-backed round-trip coverage. |

## Decisions

| Decision | Why |
| --- | --- |
| Make the Urban Shadows game fixture the destination and display-vocabulary owner; keep stable relationship keys and the creation binding in the specialised playbook. | Lantern receives the destination key, allowed relationship labels, stable persisted keys, and selection cardinality from schema-pbta rather than local game semantics. |
| Treat the specialised contract witness as the end-to-end proof. | The existing witness is registered but omits the relationship catalogue and creation binding, so it cannot demonstrate issue #7's required round trip. |
