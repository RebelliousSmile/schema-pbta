---
status: done
---

# Instruction: Prepare the immutable v6 contract line

## Tasks to do

1. Preserve `schemas/v5` byte-for-byte against its published `v5.0.0` tag.
2. Bump the public contract and package to the v6 candidate baseline, regenerate `schemas/v6`, and expose it in the package.
3. Update version/package checks and compatibility documentation for the new major.

## Test acceptance criteria

- `npm run validate:version` accepts all frozen v1–v5 schema lines and treats v6 as the unpublished candidate baseline.
- The package check resolves the v6 Monsterhearts schema with its v6.0.0 identifier.
