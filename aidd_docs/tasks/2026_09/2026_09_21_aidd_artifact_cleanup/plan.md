---
objective: "The worktree contains no unexplained AIDD artifact directories: the completed audit is intentionally versioned, and the Monsterhearts plan remains attached to its original issue."
status: in-progress
---

# Plan: Reconcile untracked AIDD artifacts

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Version the substantive 20 September audit and leave the already tracked Monsterhearts #17 plan untouched, so the worktree has no unexplained AIDD directory. |
| **Source** | [schema-pbta #18](https://github.com/RebelliousSmile/schema-pbta/issues/18) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Reconcile and version the audit | [`phase-1.md`](./phase-1.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [schema-pbta #18](https://github.com/RebelliousSmile/schema-pbta/issues/18) | The requested cleanup names the 20 September audit and the 21 September Monsterhearts plan as the two then-untracked AIDD directories. |
| [schema-pbta #17](https://github.com/RebelliousSmile/schema-pbta/issues/17) | GitHub currently reports the Monsterhearts editorial issue as closed; its local AIDD plan is already tracked and linked to that issue. |

## Decisions

| Decision | Why |
| -------- | --- |
| Version the audit reports as project history rather than delete them, after redacting their copied personal absolute path. | They are a complete seven-pillar audit with actionable findings, including the missing v6.0.0 release archive that blocks Lantern adoption, but must not reproduce a local username or filesystem layout in a public commit. |
| Keep #18 limited to artifact provenance and worktree hygiene. | Publishing a GitHub release, changing the Monsterhearts contract, or adding a column/region layout API are independent product changes and must receive their own scoped work. |
