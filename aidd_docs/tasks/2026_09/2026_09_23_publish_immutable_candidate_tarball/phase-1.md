---
status: done
---

# Instruction: Isolate and validate candidate publication

## Architecture projection

```txt
.
├── .github/workflows/publish-candidate.yml ✅ manual RC-only Linux/Node 20 publication workflow
├── tools/validate-release-candidate.ts ✅ validate tag, version, SHA ancestry and prerelease invariants
├── package.json ✏️ expose the candidate validator
└── ❌ none — stable promotion workflow stays separate
```

## User Journey

```mermaid
flowchart LR
  A[manual RC tag and SHA] --> B[validate ancestry/version]
  B --> C[Ubuntu Node 20 pack]
  C --> D[immutable prerelease with two assets]
```

## Test Scope

```mermaid
journey
  section Setup
    dispatch an rc tag and main ancestor SHA => candidate inputs are available: 5: cli
  section Happy path
    publish candidate => immutable prerelease exposes tarball and checksum only: 5: system
  section Edge case - stable or divergent input
    provide stable tag, divergent version or foreign SHA => workflow fails before release creation: 5: system
```

## Tasks to do

### `1)` Build the RC-only publisher

1. Validate the RC tag, exact package version and that the dispatched full SHA is an ancestor of `origin/main`.
2. Package under Ubuntu/Node 20, checksum, create/reuse only a prerelease, then API-verify tag, target SHA, immutability, digest and exactly two assets.
3. Keep all stable-release paths outside this workflow.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | Only an immutable RC tarball and its SHA-256 sidecar can be published from the accepted Linux/Node 20 source. |
