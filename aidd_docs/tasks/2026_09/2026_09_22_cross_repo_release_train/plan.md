---
objective: "Promote a schema-pbta archive only after immutable Lantern and Handbook commits emit matching protocol-1 adoption evidence."
status: in-progress
---

# Plan: Enforce the schema-pbta cross-repository release train

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Define one immutable candidate/evidence protocol, collect consumer-owned proofs, and promote the byte-identical schema-pbta asset only after both pass. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#23` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Define and validate protocol-1 | [`phase-1.md`](./phase-1.md) |
| 2 | Deliver consumer-owned protocol adapters | [`phase-2.md`](./phase-2.md) |
| 3 | Run and gate the immutable PbtA promotion | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/23 | Requires an immutable PbtA candidate, explicit Lantern/Handbook refs, their real proofs, and an unchanged daily gate. |
| https://github.com/RebelliousSmile/lantern/issues/20 | Closed foundation: Lantern proves lock agreement, frozen installation and Vite consumption. |
| https://github.com/RebelliousSmile/lantern/issues/33 | Tracks the separate thorn-heart Vite asset-bundling regression that the Lantern journey must reject. |
| https://github.com/RebelliousSmile/lantern/issues/34 | Open owner ticket for Lantern’s protocol-1 manifest/evidence adapter. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/53 | Closed foundation: Handbook proves Mist candidate adoption with frozen installation and render checks. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/56 | Open owner ticket for Handbook’s protocol-1 manifest/evidence adapter. |
| https://github.com/RebelliousSmile/schema-in-the-mist/issues/23 | Closed peer-provider rollout; not a consumer of the PbtA candidate. |
| https://github.com/RebelliousSmile/schema-adrenaline/issues/21 | Closed peer-provider rollout; its legacy proof shape is not a prerequisite for the first PbtA train. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep `cross-tool.config.json` and the daily CI contract job separate from release promotion. | A fixed compatibility baseline cannot prove that a newly staged archive is the installed consumer dependency. |
| Make `protocol: 1` the sole manifest/evidence envelope. | The existing PbtA, Mist, Lantern and Adrenaline proof shapes differ; the orchestrator must compare immutable data rather than interpret provider-specific results. |
| Put complete candidate identity, full consumer refs, lock attestation and an opaque journey in evidence. | Equality and provenance remain centrally verifiable while installation, rendering and bundling stay consumer-owned. |
| Require consumer adoption commits before invoking the train. | The runner must only use detached disposable checkouts with committed frozen locks; it must never rewrite a consumer manifest or lockfile. |
| Promote the archive downloaded from the immutable candidate release without rebuilding it. | The final release must contain the exact bytes proved by Lantern and Handbook. |
