---
status: pending
---

# Instruction: Record the staging manifest

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
schema-pbta/
└── release-stage.schema-pbta-v8.4.3.json ✅ bind the future candidate URL and measured archive digests to the phase-2 provider commit
```

## User Journey

```mermaid
flowchart TD
  A[Immutable provider commit] --> B[Build canonical Linux archive]
  B --> C[Measure SHA-256 and npm SRI]
  C --> D[Write stage manifest with provider SHA]
  D --> E[Validate manifest without changing provider source]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Checkout the phase-2 provider SHA in a clean release environment => source identity is fixed: 5: system
  section Happy path
    Build and measure schema-pbta 8.4.3 => manifest records candidate URL SHA-256 SRI tags and provider SHA: 5: system
    Validate the committed manifest => all release-stage provenance constraints pass: 5: system
  section Edge case - source drift
    Archive or provider SHA differs from the measured source => manifest validation or package digest check fails: 1: system
```

## Tasks to do

### `1)` Bind staging inputs to the frozen source

> Create the orchestration commit only after the provider SHA exists.

1. Build the canonical archive from the phase-2 commit under the release Node/Linux contract and calculate its SHA-256 and SHA-512 SRI.
2. Write the v8.4.3 stage manifest with the `v8.4.3-rc.1` URL, `v8.4.3` final tag, measured digests, and exact provider commit.
3. Validate the stage manifest and confirm its addition does not alter the packed payload produced from the provider commit.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | The committed stage manifest validates and names the exact phase-2 provider SHA and canonical v8.4.3 archive digests without claiming its own orchestration commit as package source. |
