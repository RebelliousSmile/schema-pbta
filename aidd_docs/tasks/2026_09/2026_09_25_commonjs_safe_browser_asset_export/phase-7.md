---
status: pending
---

# Instruction: Freeze the convergent release train

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
schema-pbta/
└── release-train/schema-pbta-v8.4.3.json ✅ bind candidate identity plus full Lantern and Handbook adoption SHAs
```

## User Journey

```mermaid
flowchart TD
  A[Immutable candidate] --> D[Train manifest]
  B[Lantern adoption SHA] --> D
  C[Handbook adoption SHA] --> D
  D --> E[Static protocol and provenance validation]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Obtain immutable consumer commit SHAs => both adoption branches are frozen: 5: cli
  section Happy path
    Write and validate train manifest => one candidate and two canonical consumer refs pass protocol checks: 5: cli
  section Edge case - mutable or divergent input
    Ref URL digest or provider commit differs => manifest validation rejects the train: 1: cli
```

## Tasks to do

### `1)` Commit the immutable train input

> Make the later evidence run refer only to already-existing commits and bytes.

1. Copy the staged candidate identity exactly and add the full Lantern and Handbook adoption SHAs with canonical repository identities and proof paths.
2. Validate the manifest, candidate URL/digests, provider ancestry, distinct consumer workspaces, and supported proof interface.
3. Commit the manifest before dispatching either train or promotion.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | The committed v8.4.3 train manifest validates and names one immutable candidate plus the exact two consumer adoption commits. |
