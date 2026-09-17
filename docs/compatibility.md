# Compatibility policy

`schema-pbta` is the canonical executable contract shared by Handbook and
Lantern. It is distributed as an immutable GitHub Release asset, not through the
npm registry.

## Compatibility matrix

| Package | Schema path | Canonical schema tag | TOML | Handbook | Lantern |
| --- | --- | --- | --- | --- | --- |
| `1.0.x` | `schemas/v1` | `v1.0.0` | `1.0.0` | `2.8.0+` | pending consumer issue #2 |
| `2.0.x` | `schemas/v2` | `v2.0.0` | `1.0.0` | `2.8.0+` | pending specialized-playbook issue |
| `3.0.x` | `schemas/v3` | `v3.0.0` | `1.0.0` | `2.8.0+` | pending consumer upgrade |
| `4.0.x` candidate | `schemas/v4` | `v4.0.0` (not yet published) | `1.0.0` | `2.8.0+` | pending consumer upgrade |

The schema path groups compatible artifacts by contract major. Every `$id`
uses its exact immutable release tag so it never depends on a movable major alias.

## SemVer

- Patch: implementation or documentation corrections that accept, normalize
  and emit exactly the same values for the current contract major.
- Minor: additive public helpers or corpus cases that do not change a published
  document shape or normalized value.
- Major: any change that rejects a previously accepted value, accepts a value
  with different meaning, invents or loses a value during normalization, or
  otherwise changes a published JSON Schema. A new major creates a new
  `schemas/v<major>` directory and an immutable `v<major>.0.0` baseline; it
  never edits older schema lines.

`npm run validate:version` compares every archived schema line with its release
tag byte-for-byte. A divergent v1, v2 or v3 artifact fails instead of silently
moving its `$id`; v4 remains a candidate baseline until `v4.0.0` is published.

## Specialized playbooks v4

Every published game has one canonical `*-playbook` type in v4. It includes its
structured mechanics and the editorial regions rendered on the sheet. A single
TOML document is the only canonical source for a character sheet. The portable
`playbook` type remains available for cross-game interchange, but cannot satisfy
a movement's `playbook` reference in the canonical corpus.

## Release and consumer integrity

`npm run release:prepare -- --output <directory>` creates the `.tgz` and a
SHA-256 sidecar. Each release must target the validated commit, contain both
assets and be published only while immutable releases are enabled for the
repository. Published tags and assets are never moved or replaced.

Consumers pin the complete HTTPS asset URL in `package.json` and commit their
lockfile. The release SHA-256 is an independent published checksum; the
lockfile's SRI value is the integrity actually enforced by the package manager.
Handbook proves esbuild compatibility in its issue #27 and Lantern proves Vite
compatibility in its issue #2, avoiding a circular producer release.
