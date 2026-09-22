---
objective: "Enforce an immutable schema-pbta release train and roll its provider-neutral promotion protocol out to every peer schema provider."
status: blocked
---

# Plan: Enforce the cross-repository release train

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Preserve the daily pinned contract gate while adding a promotion gate that coordinates one schema-pbta candidate with explicit Lantern and Handbook refs and consumer-owned proofs. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#23` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Define the release-train protocol and validator | [`phase-1.md`](./phase-1.md) |
| 2 | Orchestrate candidate validation and promotion | [`phase-2.md`](./phase-2.md) |
| 3 | Require consumer adoption evidence | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/23 | Central release-train goal and promotion conditions. |
| https://github.com/RebelliousSmile/lantern/issues/20 | Lantern must prove active-lockfile agreement and Vite consumption of the candidate asset API. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/49 | Closed foundation: Handbook proves its archive pin and source-pack installation/render path. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/52 | Closed in Handbook v2.26.0: canonical manifest/evidence interface is available. |
| https://github.com/RebelliousSmile/lantern/issues/19 | The Monsterhearts adapter is the first concrete consumer of the browser asset contract. |
| https://github.com/RebelliousSmile/schema-in-the-mist/issues/23 | Mist must adopt the same candidate-evidence-promotion protocol for its own archives. |
| https://github.com/RebelliousSmile/schema-adrenaline/issues/21 | Adrenaline must adopt the same candidate-evidence-promotion protocol for its own archives. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep the existing pinned cross-tool CI job and add a distinct release-train path. | Reproducible daily compatibility and coordinated candidate promotion answer different questions. |
| Pass only immutable candidate identity and full consumer commit SHAs into the train. | A release decision must be reproducible and never depend on branches, local checkouts, or whichever lockfile a developer used. |
| Stage the byte-identical final-version tarball under a candidate release, then attach those verified bytes to the final tag without rebuilding. | Consumer evidence must apply to the archive that final consumers receive, not merely to similarly sourced RC bytes. |
| Let Lantern and Handbook own their proof commands; schema-pbta validates their protocol and provenance. | Runtime adapters remain consumer-owned while the producer enforces the shared delivery boundary. |
| Roll the protocol out independently in every schema provider. | Mist and Adrenaline are peer providers in the shared gate, not false consumers of the schema-pbta artifact. |
