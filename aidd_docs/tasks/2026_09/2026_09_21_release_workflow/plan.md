---
objective: "Every semantic-version tag publishes an immutable schema-pbta tarball and checksum, including the previously missed v5.6.0 release."
status: implemented
---

# Plan: Publish immutable schema-pbta releases

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Add an idempotent tag release workflow and publish the existing v5.6.0 package asset. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#11` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Automate a safe tag release | [`phase-1.md`](./phase-1.md) |
| 2 | Backfill and verify v5.6.0 | [`phase-2.md`](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-in-the-mist/blob/main/.github/workflows/release.yml | Draft adoption, immutable-asset verification, and re-run semantics. |
| GitHub issue `RebelliousSmile/schema-pbta#11` | Required tag trigger, tarball, checksum, idempotence, and v5.6.0 disposition. |

## Decisions

| Decision | Why |
| --- | --- |
| Adopt an existing draft and validate an existing published release rather than overwrite it. | Published release assets are immutable; a re-run must prove success without creating an untagged draft or replacing an asset. |
