---
status: done
---

# Instruction: Publish the consumer boundary

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
package.json ✏️ Carries the next published schema-pbta version after the additive contract is validated.
package-lock.json ✏️ Records the matching package version.
README.md ✏️ Names the immutable release and closed-registry boundary for consumers.
CHANGELOG.md ✏️ Records the additive presentation-contract release.
dist/ ✅ Built package exports the vocabulary and presentation registry.
../lantern/src/templates/pbta/specialized/collectionAdapters.tsx ↗️ Consumer-owned closed mapping checked against the proposed vocabulary; never copied into schema-pbta.
../lantern/tools/assertContracts.harness.mts ↗️ Consumer assertion proving every published descriptor has a Lantern adapter and unknown keys fail closed.
```

## User Journey

```mermaid
flowchart TD
  A[Lantern closed adapter registry] --> B[Compare against schema vocabulary]
  B --> C{Every published key mapped?}
  C -->|Yes| D[Release immutable schema package]
  C -->|No| E[Coordinate missing consumer adapter before release]
  D --> F[Consumer pins exact release]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Build the package and inspect its public exports => presentation vocabulary is distributable: 5: cli
  section Happy path
    Compare every published key with Lantern's closed registry => each key has an explicit consumer mapping: 5: cli
  section Edge case - missing consumer mapping
    Detect an emitted key absent from Lantern's registry => release is blocked before consumer adoption: 5: cli
  section Teardown
    Run package and release verification => immutable artifact metadata is ready: 5: cli
```

## Tasks to do

### `1)` Gate release on consumer exhaustiveness

> Publish only a vocabulary that Lantern has explicitly agreed to resolve.

1. Compare `PBTA_COLLECTION_ITEM_EDITORS` with Lantern's typed `PBTA_COLLECTION_ADAPTERS` mapping and its `assertPbtaCollectionAdapters` harness; record any mismatch as a release blocker rather than adding a schema-side fallback.
2. Run type, presentation, presentation-corpus, document-corpus, package, and release verification after the producer contract is complete.
3. Bump every package-version location, build the distributable artifact, document the release, and create the immutable package release; only then may Lantern pin that exact release and run its adapter assertion.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | Every adapter key emitted by schema-pbta has one known `PBTA_COLLECTION_ADAPTERS` mapping and consumer harness assertion before publication. |
| 1 | A missing consumer mapping blocks release; schema-pbta never supplies a consumer-local fallback. |
| 1 | The released artifact exports the same validated vocabulary and registry that the consumer adopts by exact version. |
