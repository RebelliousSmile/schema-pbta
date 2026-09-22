---
objective: "Publish a versioned Monsterhearts appearance bundle that lets consumers resolve every declared presentation token, asset, and variant from the installed schema-pbta package."
status: implemented
---

# Plan: Publish the Monsterhearts presentation appearance bundle

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Make the producer-owned Monsterhearts presentation contract fully renderable from public, versioned npm artifacts without adding document fields or consumer-local game semantics. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#21` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Define and generate the appearance contract | [`phase-1.md`](./phase-1.md) |
| 2 | Publish redistributable appearance resources | [`phase-2.md`](./phase-2.md) |
| 3 | Enforce agreement and prove installed consumption | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/21 | Required resolved tokens, named resources, presentation-only variants, package delivery, and consumer/archive proofs. |
| `.codex/rules/00-architecture/0-cross-repo-contract-flow.md` | Schema-pbta must own versioned presentation semantics and artifacts; Handbook and Lantern consume published metadata without local semantic fallbacks. |
| `LICENSES/HANDBOOK-ASSETS.md` | Monsterhearts SVG assets are original/MIT and included fonts are OFL-licensed, so they may be published with their notices. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep a typed, producer-owned appearance source and generate its public JSON artifact beside the structural presentation contract. | One canonical definition can be checked against the structural identifier lists while JSON-only consumers receive stable, package-relative resource paths. |
| Publish only copied original/OFL resources under `packs/monsterhearts/`; do not change or depend on the Handbook consumer pack, refer to `handbook/` paths, or package official artwork. | An installed npm archive must stand alone, and document-provided `playbookImage` remains outside the appearance bundle. |
| Keep `base` and `drowned-lake` as appearance metadata referenced by the presentation contract, never as TOML fields. | Variant choice is a renderer concern and must not make portable documents game- or host-specific. |
