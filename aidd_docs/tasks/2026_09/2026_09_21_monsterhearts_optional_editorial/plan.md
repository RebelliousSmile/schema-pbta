---
objective: "Monsterhearts playbooks accept and present only their canonical editorial regions, without requiring play advice or MC guidance."
status: in-progress
---

# Plan: Optional non-Monsterhearts editorial regions

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Make `editorial.playAdvice` and `editorial.mcGuidance` absent from the required Monsterhearts contract and every published presentation surface. |
| **Source** | [schema-pbta #17](https://github.com/RebelliousSmile/schema-pbta/issues/17) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Narrow the Monsterhearts data contract | [`phase-1.md`](./phase-1.md) |
| 2 | Align presentation metadata | [`phase-2.md`](./phase-2.md) |
| 3 | Align preview and validation surfaces | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [schema-pbta #17](https://github.com/RebelliousSmile/schema-pbta/issues/17) | The two disputed editorial regions must no longer be required for Monsterhearts. |

## Decisions

| Decision | Why |
| -------- | --- |
| Keep `playAdvice` required for the generic playbook and other specialised targets, but omit it from the Monsterhearts extension. | The issue narrows only the Monsterhearts contract; changing the shared base would silently broaden unrelated games. |
| Remove `mcGuidance` from Monsterhearts rather than marking it optional. | It is not a Monsterhearts playbook region, so retaining it as optional would keep a false published semantic. |
