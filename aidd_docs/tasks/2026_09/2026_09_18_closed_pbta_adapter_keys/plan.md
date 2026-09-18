---
objective: "schema-pbta publishes a finite, validated vocabulary of declarative collection adapter keys that a consumer registry can exhaustively resolve without importing consumer code."
status: implemented
---

# Plan: Issue #9 closed PbtA adapter keys

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Prove and publish schema-owned collection adapter keys while preserving Lantern's ownership of React adapters. |
| **Source** | [GitHub issue #9](https://github.com/RebelliousSmile/schema-pbta/issues/9) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Validate the closed producer vocabulary | [phase-1.md](./phase-1.md) |
| 2 | Publish the consumer boundary | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #9](https://github.com/RebelliousSmile/schema-pbta/issues/9) | Adapter keys must be finite, declarative, producer-validated, and resolved by Lantern's closed registry. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep adapter keys as schema presentation metadata. | A finite string vocabulary describes a consumer capability without transferring component code, executable configuration, or consumer styling into the schema package. |
| Scope the first vocabulary to collection `itemEditor` values. | Future presentation descriptor families may define their own closed vocabulary instead of overloading collection keys. |
| Release the schema before consumer adoption. | Consumers must resolve an immutable package version, and key additions require Lantern registry coverage before publication. |
