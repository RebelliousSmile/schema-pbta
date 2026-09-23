---
objective: "Publish a manually dispatched immutable schema-pbta candidate tarball whose Linux/Node 20 digest becomes the release-train input."
status: implemented
---

# Plan: Publish an immutable candidate tarball

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Materialize a prerelease candidate in CI before consumer adoption, with API-verified assets and digest. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#24` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Isolate and validate candidate publication | [phase-1.md](./phase-1.md) |
| 2 | Record canonical candidate provenance | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/24 | Defines manual RC-only publication, Linux/Node 20, two assets and API verification. |
| https://github.com/RebelliousSmile/schema-adrenaline/releases/tag/v2.4.0-rc.1 | Demonstrates an immutable candidate release with tarball and SHA-256 sidecar. |

## Decisions

| Decision | Why |
| --- | --- |
| Build the candidate only in Ubuntu/Node 20 CI. | Its archive digest is the canonical value consumers will lock and prove. |
| Separate candidate publication from the final train manifest. | Consumer adoption commits can only exist after the candidate URL and digest are published. |
| Never reuse this workflow for a stable tag. | Stable promotion remains gated by #23’s successful consumer evidence. |
