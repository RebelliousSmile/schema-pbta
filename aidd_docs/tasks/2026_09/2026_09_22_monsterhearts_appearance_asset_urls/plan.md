---
objective: "Expose every published Monsterhearts browser asset through a static public ESM URL API and prove a Vite consumer can build it from the packed schema-pbta archive."
status: implemented
---

# Plan: Publish Monsterhearts appearance asset URLs

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Add the reopened #21 browser-consumer correction without replacing the appearance descriptor's package-relative resource paths. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#21`, reopening comment | 

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Export static appearance asset URLs | [`phase-1.md`](./phase-1.md) |
| 2 | Prove archive consumption with Vite | [`phase-2.md`](./phase-2.md) |
| 3 | Document, publish, and close the correction | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/21 | Requires literal `new URL(relativePath, import.meta.url)` expressions for all fonts and named assets plus a packed-archive Vite production build. |
| https://vite.dev/guide/assets | Vite transforms static `new URL(..., import.meta.url)` asset references during production builds; dynamic paths are not sufficient. |
| `.codex/rules/00-architecture/0-cross-repo-contract-flow.md` | The schema package publishes resource semantics before Lantern consumes them, without local resource maps. |

## Decisions

| Decision | Why |
| --- | --- |
| Export a typed `PBTA_MONSTERHEARTS_APPEARANCE_ASSET_URLS` registry beside the appearance descriptor, using one literal `new URL(..., import.meta.url).href` declaration per published font and logical asset. | The literal form is statically discoverable by Vite while the descriptor remains portable for non-browser consumers. |
| Validate a minimal temporary Vite project installed from the generated tarball with inlining disabled. | It tests both export reachability and emission of every named font/SVG at the actual consumer boundary. |
| Publish a v8.4.1 patch release only after the archive, Vite, and full project checks pass. | Consumers need an immutable released artifact before adopting the new schema-owned browser API. |
