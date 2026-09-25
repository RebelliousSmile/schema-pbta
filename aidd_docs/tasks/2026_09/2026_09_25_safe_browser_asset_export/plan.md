---
objective: "Promote the already published v8.4.3-rc.1 archive byte for byte after Lantern and Handbook prove its runnable artifacts at immutable commits."
status: in-progress
---

# Plan: Make browser asset exports safe for the release train

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Finish the v8.4.3 train using the immutable RC already adopted by Lantern, with Handbook's host proof and byte-identical promotion. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#41` |

Phases 1–4 are completed branch history. Their provider commit `4819c0f750901a0d94a716e7bee06af1bcb7230e` produced a non-publishing digest (`bb9e59266ed9418520866759b004d9163c7099fb9ba6030ff0ba999e55401fd7`). The immutable `v8.4.3-rc.1` release already exists from `06181fbe1e5fc1c33f85d30edfae2e1cb6581db1`; its archive SHA-256 is `1aa889767d8b737c5c05248099ba79dd9d4c5e32ce99e27927bbafd1ee6b93c4`. The release and Lantern's adoption establish that archive as the only v8.4.3 candidate for the remaining phases. The phase 4 digest is historical evidence and must never populate v8.4.3 manifests or the final release. This folder remains the active implementation plan; the task folder carried by the published tag is historical context.

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Isolate the browser asset API | [phase-1.md](./phase-1.md) |
| 2 | Verify both packed consumer formats | [phase-2.md](./phase-2.md) |
| 3 | Require host artifact evidence | [phase-3.md](./phase-3.md) |
| 4 | Prepare the patch provider commit | [phase-4.md](./phase-4.md) |
| 5 | Reconcile train code with the published candidate | [phase-5.md](./phase-5.md) |
| 6 | Record the existing immutable candidate | [phase-6.md](./phase-6.md) |
| 7 | Register immutable consumer adoption | [phase-7.md](./phase-7.md) |
| 8 | Promote and archive release evidence | [phase-8.md](./phase-8.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/41 | Defines the root import failure, packed-package checks, consumer ownership, and release acceptance criteria. |
| https://github.com/RebelliousSmile/lantern/issues/47 | Names Lantern's `vite-build` and `monsterhearts-four-assets` evidence checks and four served resources. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/63 | Requires a production build and Obsidian 1.13.7 load check in Handbook's candidate evidence. |
| https://github.com/RebelliousSmile/schema-pbta/releases/tag/v8.4.3-rc.1 | The immutable candidate targets `06181fbe...` and contains the `1aa889...` archive and checksum sidecar. |
| https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow | Confirms the existing dispatchable release workflow can run against a chosen branch or ref. |

## Decisions

| Decision | Why |
| --- | --- |
| Publish asset URLs through an explicit `schema-pbta/presentation/monsterhearts-appearance-assets` subpath and remove their runtime re-exports from both barrels. | CommonJS root imports cannot reach top-level `import.meta.url` URL construction; Vite still has a static, opt-in ESM entry. |
| Preserve protocol 1 and require role-specific named checks in its existing `journey.checks` evidence. | The existing proof interface can carry mandatory host artifact results without changing candidate identity or consumer-owned adapters. |
| Treat the published `v8.4.3-rc.1` archive and its provider commit as canonical; never restage this tag or substitute the phase 4 digest. | The release is immutable, and Lantern already pinned its SHA-256 and SRI at commit `d3de6d80fcc04f39edd4d733aa8304a6b772b481`. |
| Reconcile this branch with the RC source before running train or promotion workflows. | The branch currently requires different Handbook check IDs and omits the Obsidian 1.13.7 host setup present at the published tag. Its provider commit must also become an ancestor of the workflow ref. |
| Record the existing asset directly in matching stage and candidate manifests; do not dispatch another stage job. | The candidate was published through the other candidate route, and a rebuild from this branch would produce different bytes. |
| Require packed CommonJS and Vite checks for any future candidate publication. | Both candidate routes must validate runnable package formats, even though this RC needs no new publication. |
| Consume Lantern's immutable adoption ref and wait for Handbook's immutable ref with `commonjs-plugin-build` and `obsidian-1.13.7-plugin-load`. | The provider owns the train and evidence checks; consumer repositories own their adapters and artifact proofs. |
| Promote by downloading the published RC asset and verifying its SHA-256 and SRI before and after publication. | Issue #41 requires candidate and final archives to be byte-identical. |
| If the final tag exists after a partial promotion, verify it against the RC and recover missing evidence without republishing. | Immutable release creation may succeed before the workflow uploads provenance or the evidence commit lands. |
