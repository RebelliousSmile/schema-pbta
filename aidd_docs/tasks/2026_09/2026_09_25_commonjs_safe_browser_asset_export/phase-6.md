---
status: pending
---

# Instruction: Prove and promote the byte-identical patch

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
GitHub Actions release-train provenance ✅ records both external consumers and four host-artifact checks
GitHub Release v8.4.3 ✅ reuses the candidate tarball and checksum on the provider commit
GitHub issue #41 ✏️ closes with train, release, and matching-digest evidence
```

## User Journey

```mermaid
flowchart TD
  A[Committed train manifest] --> B[Checkout pinned external consumer commits]
  B --> C[Run four mandatory artifact checks]
  C --> D[Download candidate archive]
  D --> E[Attach the same file to final tag]
  E --> F[Verify final SHA-256 and close provider issue]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Dispatch train from committed manifest => isolated pinned consumer workspaces are created: 5: system
  section Happy path
    Complete both external proofs => provenance records four mandatory checks against exact candidate bytes: 5: system
    Promote downloaded candidate => final archive SHA-256 equals candidate SHA-256: 5: system
  section Edge case - divergent evidence
    Lock ref digest required check build or host load differs => promotion remains blocked: 1: system
```

## Tasks to do

### `1)` Run the pinned consumer train

> Verify the external deliveries without taking ownership of their implementation.

1. Dispatch the train with the committed manifest and provider SHA, then wait for both pinned consumer proofs and retain the provenance artifact.
2. Confirm Lantern reports `vite-build` and `monsterhearts-four-assets`, while Handbook reports `commonjs-plugin-build` and `obsidian-1.13.7-plugin-load`.

### `2)` Promote without rebuilding

> Make the stable provider release byte-identical to the candidate both consumers executed.

1. Dispatch promotion only after the train passes; download and reuse the candidate archive without invoking `npm pack`.
2. Verify the final immutable release targets the provider commit and its downloaded archive SHA-256 equals the staged digest.
3. Record the train run, release, external issue references, and matching digest on issue #41, then close it.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | Retained provenance names both pinned external consumers and all four mandatory host-artifact checks for the same candidate. |
| 2 | The final v8.4.3 archive SHA-256 equals the candidate SHA-256 and issue #41 closes only after that equality is recorded. |
