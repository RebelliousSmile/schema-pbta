---
status: pending
---

# Instruction: Publish the immutable patch candidate

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
GitHub Release v8.4.3-rc.1 ✅ immutable candidate tarball and SHA-256 sidecar targeting the recorded provider commit
```

## User Journey

```mermaid
flowchart TD
  A[Committed stage manifest] --> B[Stage workflow checks out provider SHA]
  B --> C[Rebuild and validate packed archive]
  C --> D[Match manifest SHA-256 and SRI]
  D --> E[Publish immutable candidate and checksum]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Dispatch stage mode with committed manifest and provider SHA => isolated release job starts: 5: system
  section Happy path
    Complete stage workflow => immutable prerelease targets provider SHA and exposes exactly tarball plus checksum: 5: system
  section Edge case - digest mismatch
    Rebuilt archive differs from manifest => publication is refused: 1: system
```

## Tasks to do

### `1)` Stage the proved provider bytes

> Publish the candidate only after the committed staging contract is satisfied.

1. Push the provider and manifest commits, then dispatch `release.yml` in stage mode with the recorded inputs.
2. Wait for the workflow to pass and verify the prerelease is immutable, targets the provider commit, and carries exactly the v8.4.3 tarball and checksum.
3. Record the reachable candidate URL and digests for both consumer adoption branches.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | The immutable v8.4.3-rc.1 release targets the phase-2 provider commit and publishes the exact manifest-matching archive and checksum. |
