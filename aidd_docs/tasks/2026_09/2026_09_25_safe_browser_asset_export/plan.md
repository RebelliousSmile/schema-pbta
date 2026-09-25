---
objective: "Release a patch archive whose root imports execute in a CommonJS Handbook bundle, whose explicit browser asset path works in Vite, and whose promotion is gated by both consumers' artifact proofs of the same bytes."
status: in-progress
---

# Plan: Make browser asset exports safe for the release train

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Isolate browser URL construction, test packed CommonJS and Vite consumers, and require artifact evidence before byte-identical promotion. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#41` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Isolate the browser asset API | [phase-1.md](./phase-1.md) |
| 2 | Verify both packed consumer formats | [phase-2.md](./phase-2.md) |
| 3 | Require host artifact evidence | [phase-3.md](./phase-3.md) |
| 4 | Prepare the patch provider commit | [phase-4.md](./phase-4.md) |
| 5 | Record the canonical candidate digest | [phase-5.md](./phase-5.md) |
| 6 | Stage and verify the immutable candidate | [phase-6.md](./phase-6.md) |
| 7 | Register immutable consumer adoption | [phase-7.md](./phase-7.md) |
| 8 | Promote and archive release evidence | [phase-8.md](./phase-8.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/41 | Defines the root import failure, packed-package checks, consumer ownership, and release acceptance criteria. |
| https://github.com/RebelliousSmile/lantern/issues/47 | Names Lantern's `vite-build` and `monsterhearts-four-assets` evidence checks and four served resources. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/63 | Requires a production build and Obsidian 1.13.7 load check in Handbook's candidate evidence. |
| https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow | Confirms the existing dispatchable release workflow can run against a chosen branch or ref. |

## Decisions

| Decision | Why |
| --- | --- |
| Publish asset URLs through an explicit `schema-pbta/presentation/monsterhearts-appearance-assets` subpath and remove their runtime re-exports from both barrels. | CommonJS root imports cannot reach top-level `import.meta.url` URL construction; Vite still has a static, opt-in ESM entry. |
| Preserve protocol 1 and require role-specific named checks in its existing `journey.checks` evidence. | The existing proof interface can carry mandatory host artifact results without changing candidate identity or consumer-owned adapters. |
| Use a fresh patch version and candidate tag; never reuse the immutable v8.4.2 archive. | Existing candidate and final assets cannot change, and consumers must adopt the exact replacement archive before promotion. |
| Build the staged archive from the manifest's exact provider commit. | The current staging workflow accepts an ancestor commit while building the checkout HEAD, which could attach bytes from a different source revision. |
| Require packed CommonJS and Vite checks in both candidate publication workflows. | `publish-candidate.yml` is another active route to an immutable RC and currently does not run `validate:package`. |
| Separate provider preparation, manifest publication, staging, adoption, and promotion into distinct commits. | A manifest must name an earlier immutable commit, and GitHub Actions must read a committed manifest before its result can be asserted. |
