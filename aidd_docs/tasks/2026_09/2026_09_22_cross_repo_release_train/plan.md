---
objective: "Enforce one provider-neutral immutable release-train contract before adapters promote schema candidates through Handbook and Lantern."
status: in-progress
---

# Plan: Enforce the cross-repository release train

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Preserve the daily pinned contract gate while defining one manifest/evidence protocol that coordinates a provider candidate with explicit Handbook and Lantern refs and consumer-owned proofs. |
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
| https://github.com/RebelliousSmile/schema-in-the-mist/issues/23 | Separate provider rollout: Mist owns its own candidate and dependency-lock migration. |
| https://github.com/RebelliousSmile/schema-adrenaline/issues/21 | Separate provider rollout: Adrenaline owns its own candidate and dependency-lock migration. |

## Recorded progress — 2026-09-23

- The initial PbtA-only protocol, runner and candidate/final promotion workflows exist locally on `feat/cross-repo-release-train`; they are not sufficient to complete the inter-repository train.
- Two isolated consumer worktrees are clean and ready for convergent validation.
- Handbook v2.26.0 exposes a PbtA manifest proof, but its input/output is PbtA-specific and incompatible with the current Adrenaline direct-JSON workflow.
- Lantern `main` has the Monsterhearts renderer from #19 but no published `release-train:assert` proof; #20 remains the host-adapter ticket.
- A frozen Lantern installation resolves all three direct schema archives. Its adoption commit must retain their versions while recording stable URLs and SRI for `schema-pbta`, `schema-in-the-mist`, and `schema-adrenaline`; signed redirect URLs are invalid.
- The next implementation unit is therefore the shared envelope, not a provider-specific consumer script.

## Decisions

| Decision | Why |
| --- | --- |
| Keep the existing pinned cross-tool CI job and add a distinct release-train path. | Reproducible daily compatibility and coordinated candidate promotion answer different questions. |
| Pass only immutable candidate identity and full consumer commit SHAs into the train. | A release decision must be reproducible and never depend on branches, local checkouts, or whichever lockfile a developer used. |
| Stage the byte-identical final-version tarball under a candidate release, then attach those verified bytes to the final tag without rebuilding. | Consumer evidence must apply to the archive that final consumers receive, not merely to similarly sourced RC bytes. |
| Let Lantern and Handbook own their proof commands; schema-pbta validates their protocol and provenance. | Runtime adapters remain consumer-owned while the producer enforces the shared delivery boundary. |
| Track peer-provider rollout independently. | Mist and Adrenaline are peer providers in the shared gate, not consumers of the schema-pbta artifact or hidden prerequisites for this plan. |
| Define a protocol-versioned, provider-neutral envelope before consumer adapters. | Handbook and Adrenaline currently exchange incompatible proof shapes; a common contract prevents a special format per provider. |
| Let the orchestrator compare evidence only, never dispatch provider-specific commands. | It can enforce equality and provenance without owning consumer journeys. |

## Target common envelope

```json
{
  "protocol": 1,
  "candidate": {
    "provider": "schema-pbta",
    "releaseUrl": "https://…",
    "sha256": "…",
    "integrity": "sha512-…",
    "version": "8.4.2",
    "stagingTag": "v8.4.2-rc.1",
    "finalTag": "v8.4.2",
    "providerCommit": "<40-char SHA>"
  },
  "consumers": [{ "role": "handbook", "repository": "owner/repository", "ref": "<40-char SHA>" }]
}
```

Each evidence file repeats the complete candidate, identifies exactly one resolved consumer, attests its lock/integrity state, and records an opaque executed journey (`id`, `status`, `checks`). The orchestrator compares those fields strictly against the manifest and does not interpret a provider-specific command or journey name.
